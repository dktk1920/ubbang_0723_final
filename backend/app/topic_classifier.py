# backend/app/topic_classifier.py

import os
from typing import Optional
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

client = AsyncOpenAI()

# ✅ 대화 주제 추출 프롬프트 템플릿
TOPIC_CLASSIFICATION_PROMPT = """
다음 사용자 발화의 주제를 한 단어 또는 두 단어로 분류해줘.
형식 없이 핵심 주제만 간단히 말해줘.

대답은 설명 없이 주제만 출력해. 아래처럼.

예시 입력:
"요즘 나 너무 뒤처지는 기분이야... 진로도 안 잡히고"
→ 진로

"사람 만나는 게 너무 어렵고 불편해"
→ 대인관계

"자존감이 너무 낮아진 것 같아. 나 스스로가 싫어"
→ 자존감

"나 부모님이랑 계속 싸우게 돼. 너무 힘들어"
→ 가족

"그냥 요즘 별 생각 없이 지내는 중이야"
→ 잡담

입력:
"{user_text}"
→
"""

async def classify_topic(user_text: str) -> Optional[str]:
    prompt = TOPIC_CLASSIFICATION_PROMPT.format(user_text=user_text.strip())

    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        topic = response.choices[0].message.content.strip()
        return topic
    except Exception as e:
        print(f"[topic_classifier] 주제 분류 오류: {e}")
        return None
