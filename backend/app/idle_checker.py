# # 구현 요약
# # 1	유저 활동 시마다 last_active_time 업데이트
# # 2	백그라운드에서 30분마다 last_active_time < now - 4시간 인 유저 검사
# # 3	검사된 유저는 DynamoDB에서 메시지 가져와 FAISS 저장
# # ---> 4시간 넘게 유휴 상태인 유저가 있으면 → 해당 유저의 대화 불러와서 FAISS에 저장
#
# # ✅ 전체 흐름
# # 1. save_message_to_dynamo → last_active_time 갱신됨
# # 2. idle_checker → 30분마다 전체 유저 검사
# # 3. last_active_time이 4시간 이상 과거인 유저 → get_recent_messages로 불러옴
# # 4. save_to_faiss로 FAISS에 저장
#
# # app/idle_checker.py
#
# import time
# import os
# import asyncio
# import boto3
# from boto3.dynamodb.conditions import Key
# from typing import List
#
# from .faiss_helper import save_to_faiss
# from .dynamo_utils import get_recent_messages
#
# dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-2")
# table = dynamodb.Table(os.getenv("DYNAMO_TABLE_NAME", "ChatMessages"))
#
# IDLE_THRESHOLD = 60 * 60 * 4  # 4시간
#
# async def start_idle_checker():
#     while True:
#         print("⏰ [타이머] 4시간 이상 유휴 유저 검사 중...")
#         now = int(time.time())
#
#         try:
#             response = table.scan(
#                 ProjectionExpression="pk, last_active_time"
#             )
#             items = response.get("Items", [])
#
#             for item in items:
#                 pk = item["pk"]
#                 last_active = item.get("last_active_time")
#                 if not last_active:
#                     continue
#
#                 if now - last_active > IDLE_THRESHOLD:
#                     print(f"📦 {pk} → 4시간 이상 유휴 상태 → FAISS 저장 시작")
#                     messages = get_recent_messages(pk, limit=30)
#                     if messages:
#                         save_to_faiss(pk, messages)
#
#         except Exception as e:
#             print(f"[ERROR] idle_checker 실패: {e}")
#
#         await asyncio.sleep(60 * 30)  # 30분마다 실행
#
#