## GPT 응답생성
## 시스템 프롬프트, 메모리 기반 응답, 쿼리 타입 감지 포함

# ---------------------------------------------------------------------
# 6/30 사항
# BufferMemory 관련 코드 수정
# chat.py에서 실제 사용되는 함수들만 정리
# 불필요한 함수 제거 및 인자 구조 통일
# ------------------------------------------------------------------------

# app/openai_helper.py
from openai import OpenAI
import os
from dotenv import load_dotenv

from .BasePrompt_builder import BasePromptBuilder
from .dynamo_utils import get_recent_messages_from_dynamo

from langchain_openai import ChatOpenAI
from langchain.memory import ConversationBufferMemory
from langchain_core.prompts import ChatPromptTemplate
from langchain.chains import LLMChain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

from .prompt_assembler import assemble_system_prompt

from typing import List
from openai import AsyncOpenAI

# --------------------------------------------------------------------------------

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
llm = ChatOpenAI(model="gpt-4o", temperature=0.7)

# -------------------------------------------------------------------------------

# 🎯 LangChain 기반 응답 memory (유저별로 분리)
user_memory_store = {}


def get_user_memory(pk: str) -> ConversationBufferMemory:
    """
    유저별 메모리 가져오기 (DynamoDB에서 최근 메시지 복원)
    """
    if pk in user_memory_store:
        return user_memory_store[pk]

    memory = ConversationBufferMemory(return_messages=True)

    # 💡 DynamoDB에서 최근 메시지 불러오기
    recent = get_recent_messages_from_dynamo(pk, limit=10)
    for msg in recent:
        if msg["role"] == "user":
            memory.chat_memory.add_user_message(msg["content"])
        elif msg["role"] == "assistant":
            memory.chat_memory.add_ai_message(msg["content"])

    user_memory_store[pk] = memory
    return memory


# --------------------------------------------------------------------------------

# 쿼리 타입 감지 (개인기록 / 외부정보 / 일반대화)
def detect_query_type(message: str) -> str:
    """
    유저메시지의 쿼리 타입을 감지
    """
    prompt = f"""
    다음 유저의 발화를 읽고, 어떤 응답 방식이 적절한지 하나만 골라줘.
    - 개인기록검색
    - 외부정보검색
    - 일반대화

    유저 발화: "{message}"
    적절한 방식:"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.0,
    )
    return response.choices[0].message.content.strip()


# --------------------------------------------------------------------------------

# ✅ 벡터 검색 필요 여부 판단 (vector vs memory)
def should_use_vector_search(user_input: str) -> bool:
    """
    사용자 입력이 과거 대화 검색이 필요한지 판단
    """
    try:
        prompt = f"""
다음 사용자의 질문이 과거 대화 기록을 기반으로 검색해야 할 내용인지 판단해줘.

질문: "{user_input}"

답변 형식은 반드시 다음 중 하나로 해줘:
- vector → 과거 대화 검색 필요
- memory → 현재 대화 흐름에 응답

정답:
"""

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
        )
        answer = response.choices[0].message.content.strip().lower()
        return "vector" in answer

    except Exception as e:
        print(f"[쿼리 분류 실패] {e}")
        return False


# --------------------------------------------------------------------------------

async def summarize_chunks(chunks: List[str]) -> str:
    """
    FAISS 검색 결과를 요약
    """
    if not chunks:
        return ""
    summary_prompt = f"""
다음은 과거의 대화 기록이야. 이걸 보고 핵심 내용을 한 단락으로 정리해줘. 너무 길게 말하지 말고 간결하게 정리해줘.

---

{chr(10).join(chunks)}

---
요약:"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": summary_prompt}],
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"[요약 실패] {e}")
        return ""


# --------------------------------------------------------------------------------

# -- 스트리밍 응답 생성기 ----------------------------------
stream_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))


async def stream_gpt_response(system_prompt: str, memory: ConversationBufferMemory, user_input: str):
    """
    트리밍 GPT 응답 생성기
    """
    try:
        messages = [
            {"role": "system", "content": system_prompt},
        ]
        # memory를 chat format으로 추가
        for msg in memory.chat_memory.messages:
            role = "user" if msg.type == "human" else "assistant"
            messages.append({"role": role, "content": msg.content})
        messages.append({"role": "user", "content": user_input})

        # 스트리밍 요청
        response = await stream_client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            temperature=0.7,
            stream=True,
        )

        async for chunk in response:
            delta = chunk.choices[0].delta
            if delta and delta.content:
                yield delta.content
    except Exception as e:
        print(f"[Stream 응답 오류] {e}")
        yield "⚠️ 오류가 발생했어요."
