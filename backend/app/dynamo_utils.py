# 유저가 채팅할 때마다 last_active_time 갱신됨
# idle_checker.py가 30분마다 모든 유저 스캔해서
# 4시간 이상 유휴 유저 찾음
# 해당 유저의 최근 30개 메시지를 get_recent_messages로 가져와
# save_to_faiss()로 저장됨

# get_recent_messages() 함수는 idle_checker.py에서
# 유저 pk를 받아 해당 유저의 최근 메시지들을 DynamoDB에서 불러오는 역할이야.

# app/dynamo_utils.py



import os
import time
import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from typing import List, Dict
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv

load_dotenv()
dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-2")

# 테이블 객체들
chat_table = dynamodb.Table(os.getenv("DYNAMO_TABLE_NAME", "ChatMessages"))
emotion_table = dynamodb.Table(os.getenv("EMOTION_TABLE_NAME", "EmotionTopicLog"))
diary_table = dynamodb.Table(os.getenv("DIARY_TABLE_NAME", "EmotionDiary"))

# ✅ 최근 메시지 불러오는 함수 (기본 30개)
def get_recent_messages_from_dynamo(pk: str, limit: int = 10) -> List[Dict[str, str]]:
    try:
        response = chat_table.query(
            KeyConditionExpression=Key("pk").eq(pk),
            ScanIndexForward=False,  # 최신순 정렬
            Limit=limit
        )
        items = response.get("Items", [])
        items.reverse()  # 오래된 순서로 정렬
        messages = [
            {"role": item["role"], "content": item["content"]}
            for item in items if "role" in item and "content" in item
        ]
        return messages
    except Exception as e:
        print(f"[ERROR] get_recent_messages 실패: {e}")
        return []

# ✅ timestamp → diary_date 변환 함수 (KST 6시 기준)
def get_diary_date_kst(ts: int) -> str:
    KST = timezone(timedelta(hours=9))
    dt = datetime.fromtimestamp(ts, tz=KST)
    if dt.hour < 6:
        dt -= timedelta(days=1)
    return dt.strftime("%Y-%m-%d")

# # ✅ 감정/주제 저장 함수
# def save_emotion_topic_log(pk: int, timestamp: datetime, emotion: str, topic: str):
#     try:
#         ts = int(timestamp.timestamp())
#         diary_date = get_diary_date_kst(ts)
#
#         item = {
#             "pk": pk,
#             "timestamp": ts,
#             "emotion": emotion,
#             "topic": topic,
#             "diary_date": diary_date
#         }
#
#         emotion_table.put_item(Item=item)
#         print(f"✅ 감정/주제 저장 완료: {item}")
#     except ClientError as e:
#         print(f"❌ 감정/주제 저장 실패: {e.response['Error']['Message']}")

# ✅ 감정 그림일기 저장 함수
from .emotionUtils import get_emotion_level
from .utils import generate_warm_message_from_summary
import uuid
def save_diary_to_dynamo(pk: str, date: str, summary: str, image_url: str):
    diary_id = str(uuid.uuid4())

    try:
        # 감정 레벨 분석
        level = get_emotion_level(summary)
        print(f"🧠 감정 분석 결과: {level}")

        # GPT 메시지 생성
        warm_message = generate_warm_message_from_summary(summary)
        print(f"💬 생성된 따뜻한 한마디: {warm_message}")

        item = {
            "id": diary_id,
            "pk": pk,
            "date": date,
            "summary": summary,
            "image_url": image_url,
            "emotion_level": int(level),
            "message": warm_message  # ✅ 추가 저장
        }

        diary_table.put_item(Item=item)
        print("✅ 감정 그림일기 저장 완료:", item)
        return diary_id

    except Exception as e:
        print(f"❌ 감정 그림일기 저장 실패: {e}")
        return None


# ✅ 감정일기 요약용 메시지 불러오기 (ChatMessages 기준)ㅠ -----------------------------
def get_messages_for_diary(pk: str, diary_date: str) -> list[str]:
    try:
        response = chat_table.query(
            KeyConditionExpression=Key("pk").eq(pk),
            ScanIndexForward=True  # 시간순 정렬
        )
        all_items = response.get("Items", [])

        messages = [
            f"{item.get('role', 'user')}: {item.get('content', '')}"
            for item in all_items
            if get_diary_date_kst(item.get("timestamp", 0)) == diary_date
            and "content" in item
        ]
        return messages
    except Exception as e:
        print(f"[ERROR] get_messages_for_diary 실패: {e}")
        return []

#-----------------------------------------------------------------
# ✅ 회원가입 시 UserStats 초기화 함수 (캐릭터 수집관련 부분)
def init_user_stats(pk: int):
    stats_table = dynamodb.Table("UserStats")  # 💡 너의 테이블 이름에 맞게 수정
    stats_table.put_item(
        Item={
            "pk": str(pk),
            "chat_count": 20,
            "star_candy": 4
        }
    )
    print(f"✅ UserStats 초기화 완료: pk={pk}, chat_count=20, star_candy=4")

