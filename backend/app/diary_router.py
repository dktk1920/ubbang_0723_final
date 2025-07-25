from fastapi import APIRouter, Query, HTTPException
import boto3, os
from boto3.dynamodb.conditions import Key

router = APIRouter()

# ✅ DynamoDB 테이블 연결
dynamodb = boto3.resource("dynamodb", region_name=os.getenv("AWS_REGION"))
table = dynamodb.Table("EmotionDiary")  # 실제 테이블명 사용

@router.get("")
def get_diary_list(pk: str = Query(...)):
    response = table.query(
        IndexName="pk-index",
        KeyConditionExpression=Key("pk").eq(str(pk)),
        ScanIndexForward=False
    )

    items = response.get("Items", [])

    result = []
    for item in items:
        result.append({
            "id": item.get("id", ""),                   # ✅ 고유 id
            "date": item.get("date", ""),               # ✅ 날짜
            "summary": item.get("summary", ""),         # ✅ 요약
            "imageUrl": item.get("image_url", ""),      # ✅ 이미지
            "emotion_level": item.get("emotion_level"), # ✅ 감정 레벨 추가
            "pk": item.get("pk", ""),
            "message": item.get("message", "")
        })

    return result


@router.get("/{diary_id}")
def get_diary_by_id(diary_id: str, pk: str = Query(...)):
    response = table.query(
        IndexName="pk-index",
        KeyConditionExpression=Key("pk").eq(str(pk)),
        ScanIndexForward=False
    )
    for item in response.get("Items", []):
        print("🔍 비교 대상 id:", item.get("id"))  # ← 여기서 비교 대상 출력

        if item.get("id") == diary_id:
            print("📦 반환되는 item 내용:", item)
            return item

    print("❌ 일기 못 찾음")
    raise HTTPException(status_code=404, detail="Diary not found")


