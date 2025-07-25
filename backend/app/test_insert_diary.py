import boto3
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
import os

# ✅ .env 파일 로드
load_dotenv()

# ✅ AWS 리전 및 테이블명
REGION_NAME = "ap-northeast-2"  # 서울 리전
TABLE_NAME = "EmotionDiary"     # 너의 실제 테이블명으로 수정 가능

# ✅ DynamoDB 초기화
dynamodb = boto3.resource(
    "dynamodb",
    region_name=REGION_NAME,
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
)
table = dynamodb.Table(TABLE_NAME)

# ✅ 테스트 데이터 생성
test_item = {
    "pk": "65",
    "date": "2025-07-17",
    "emotion": "happy",
    "topic": "칭찬",
    "summary": "너는 오늘도 웃음을 잃지 않았어. 참 멋져!",
    "image_url": "https://your-bucket.s3.ap-northeast-2.amazonaws.com/sample.jpg"
}

# ✅ DynamoDB에 저장
try:
    table.put_item(Item=test_item)
    print("✅ 테스트 감정일기 삽입 완료!")
except Exception as e:
    print("❌ 삽입 실패:", e)
