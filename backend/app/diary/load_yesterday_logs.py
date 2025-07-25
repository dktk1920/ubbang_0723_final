from datetime import datetime, timedelta, timezone
import boto3
from boto3.dynamodb.conditions import Key

KST = timezone(timedelta(hours=9))
dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("EmotionLogs")  # ✅ 너가 감정로그 저장한 테이블명으로 수정

# 어제 하루의 timestamp 범위 계산
def get_timestamp_range_for_yesterday() -> tuple[int, int]:
    now = datetime.now(tz=KST)

    start = datetime(year=now.year, month=now.month, day=now.day, hour=6, tzinfo=KST) - timedelta(days=1)
    end = start + timedelta(days=1) - timedelta(seconds=1)

    return int(start.timestamp()), int(end.timestamp())


#  범위를 기반으로 하루치 감정 로그 조회
def load_yesterday_logs(pk: str) -> list[dict]:
    start_ts, end_ts = get_timestamp_range_for_yesterday()

    response = table.query(
        KeyConditionExpression=Key("pk").eq(pk) & Key("timestamp").between(start_ts, end_ts)
    )

    return response.get("Items", [])
