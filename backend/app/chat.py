from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
import os, uuid, time, asyncio
from dotenv import load_dotenv
import boto3
from boto3.dynamodb.conditions import Key
from datetime import datetime

# 사용자 정의 모듈
from .BasePrompt_builder import BasePromptBuilder
from .openai_helper import (
    get_user_memory,
    detect_query_type,
    should_use_vector_search,
    summarize_chunks,
    stream_gpt_response
)
from .weather import get_weather_data
from .utils import extract_city_from_message, get_today_datetime_info
from .contextual_info import get_contextual_info_reply
from .naver_helper import get_external_info
from .faiss_helper import save_to_faiss, search_from_faiss
from .prompt_assembler import assemble_system_prompt
from .topic_classifier import classify_topic

from .update_user_stats import increment_chat_count

# -------------------------------------------------------------------------------

load_dotenv()
router = APIRouter()
dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-2")
table = dynamodb.Table(os.getenv("DYNAMO_TABLE_NAME", "ChatMessages"))

# -------------------------------------------------------------------------------

def update_last_active_time(pk: str):
    try:
        table.update_item(
            Key={"pk": pk, "timestamp": 0},
            UpdateExpression="SET last_active_time = :t",
            ExpressionAttributeValues={":t": int(time.time())}
        )
    except Exception as e:
        print(f"[ERROR] last_active_time 업데이트 실패: {e}")

from .dynamo_utils import get_diary_date_kst
def save_message_to_dynamo(pk: str, userId: str, role: str, content: str, gender: str, tf: str):
    try:
        ts = int(time.time())  # ✅ 여기서 매번 새로운 timestamp 생성 , ts = int(time.time())
        diary_date = get_diary_date_kst(ts)
        table.put_item(
            Item={
                "pk": str(pk),
                "timestamp": ts,
                "userId": str(userId),
                "diary_date": diary_date,
                "gender": gender,
                "tf": str(tf),
                "role": role,
                "content": content,
                "message_id": str(uuid.uuid4())
            }
        )
    except Exception as e:
        print(f"[ERROR] 메시지 저장 실패: {e}")

# -------------------------------------------------------------------------------

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    pk = str(websocket.query_params.get("pk"))
    userId = websocket.query_params.get("userId", f"guest-{str(uuid.uuid4())}")
    gender = websocket.query_params.get("gender", "female")
    mode = websocket.query_params.get("mode", "banmal")
    age = int(websocket.query_params.get("age", "25"))
    tf = websocket.query_params.get("tf", "F")

    print(f"📥 WebSocket 요청 들어옴: pk={pk}, user_id={userId}, mode={mode}, gender={gender}, age={age}, tf={tf}")

    memory = get_user_memory(pk)
    embedding_counter = 0
    buffered_messages = []

    from datetime import datetime, timezone, timedelta

    try:
        while True:
            user_msg = await websocket.receive_text()
            print(f"👤 유저 메시지: {user_msg}")

            # 1. timestamp 먼저 정의
            KST = timezone(timedelta(hours=9))
            timestamp = datetime.now(KST)

            # 2. 감정/주제 추론
            # # emotion = await extract_emotion(user_msg)
            topic = await classify_topic(user_msg)
            # # print(f"🎯 감정 추론 결과: {emotion if emotion else '❌ 감정 없음'}")
            print(f"🎯 주제 분류 결과: {topic if topic else '❌ 주제 없음'}")

            # # 3. 감정/주제 저장 (한 번만)
            # if emotion and topic:
            #     save_emotion_topic_log(pk, timestamp, emotion, topic)

            # 4. 메시지 저장
            save_message_to_dynamo(pk, userId, "user", user_msg, gender, tf)
            # ✅ UserStats 갱신: chat_count 증가, star_candy 지급
            increment_chat_count(int(pk))


            # 5. 마지막 활동 시간 업데이트
            update_last_active_time(pk)

            # 6. system prompt 생성
            system_prompt = assemble_system_prompt(
                gender=gender,
                mode=mode,
                age=age,
                tf=tf,
                topic=topic
            )

            update_last_active_time(pk)

            contextual_reply = await get_contextual_info_reply(user_input=user_msg, system_prompt=system_prompt, memory=memory)
            if contextual_reply:
                save_message_to_dynamo(pk, userId, "assistant", contextual_reply, gender, tf)
                memory.chat_memory.add_user_message(user_msg)
                memory.chat_memory.add_ai_message(contextual_reply)
                await websocket.send_text(contextual_reply)
                continue

            query_type = detect_query_type(user_msg)
            print(f"🔍 쿼리 유형 감지: {query_type}")

            if query_type == "외부정보검색":
                await websocket.send_text("...")  # 입력중 표시
                external_info = await get_external_info(user_msg, mode)
                prompt = f"{system_prompt}\nuser: {user_msg}\n\n외부 검색 결과:\n{external_info}"

                full_response = ""
                async for token in stream_gpt_response(prompt, memory, user_msg):
                    await websocket.send_text(token)
                    full_response += token

                reply = full_response
            else:
                retrieved_chunks = search_from_faiss(pk, user_msg) if should_use_vector_search(user_msg) else []
                context_summary = await summarize_chunks(retrieved_chunks[:10]) if retrieved_chunks else None

                system_prompt_with_context = system_prompt
                if context_summary:
                    system_prompt_with_context += f"\n\n# 유저 과거 요약 내용:\n{context_summary}"

                await websocket.send_text("...")  # 입력중 표시

                full_response = ""
                async for token in stream_gpt_response(system_prompt_with_context, memory, user_msg):
                    await websocket.send_text(token)
                    full_response += token

                reply = full_response

            save_message_to_dynamo(pk, userId, "assistant", reply, gender, tf)
            update_last_active_time(pk)
            memory.chat_memory.add_user_message(user_msg)
            memory.chat_memory.add_ai_message(reply)

            buffered_messages.append({"role": "user", "content": user_msg})
            buffered_messages.append({"role": "assistant", "content": reply})
            embedding_counter += 1

            if embedding_counter >= 10:
                save_to_faiss(pk, buffered_messages)
                embedding_counter = 0
                buffered_messages = []

    except WebSocketDisconnect:
        print("❌ WebSocket 연결 끊김")
    except Exception as e:
        print(f"❌ 예외 발생: {e}")
        await websocket.send_text("⚠️ 오류가 발생했어요. 잠시 후 다시 시도해주세요.")
    finally:
        if buffered_messages:
            print("📦 WebSocket 종료 시점 FAISS 저장 실행")
            save_to_faiss(pk, buffered_messages)



# -------------------------------------------------------------------------------

@router.get("/chat/history")
def get_chat_history(pk: str):
    try:
        response = table.query(
            KeyConditionExpression=Key("pk").eq(pk),
            ScanIndexForward=True
        )
        items = response.get("Items", [])
        return [
            {
                "id": item.get("message_id", f"{item['pk']}_{item['timestamp']}"),
                "content": item.get("content", ""),  # ✅ 안전하게 접근
                "sender": "ai" if item.get("role") == "assistant" else "user",
                "timestamp": datetime.fromtimestamp(item["timestamp"]).isoformat()
            }
            for item in items
            if item.get("timestamp") != 0 and "content" in item
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB 조회 실패: {str(e)}")

