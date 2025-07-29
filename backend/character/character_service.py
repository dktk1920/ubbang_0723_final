# 캐릭터 수집정책 관련 핵심 로직 코드임다

import boto3
from datetime import datetime, timezone, timedelta
from character.character_utils import draw_random_character

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table("UserCharacters")
stat_table = dynamodb.Table("UserStats")  # chat_count, star_candy
KST = timezone(timedelta(hours=9))
datetime.now(KST).isoformat()

#여기 밑이 추가한 부분
def initialize_user_stats(pk: str):
    """Initialize UserStats for a new user."""
    stat_table.put_item(
        Item={
            "pk": str(pk),
            "star_candy": 0,
            "chat_count": 0,
            "created_at": datetime.now(KST).isoformat()
        }
    )

def unlock_random_character(pk: int) -> dict:
    # 별사탕 확인
    stats = stat_table.get_item(Key={"pk": str(pk)}).get("Item")
    if not stats or stats["star_candy"] < 1:
        return {"error": "별사탕이 부족합니다."}

    # 캐릭터 뽑기
    char_id, rarity = draw_random_character()

    # 이미 뽑았는지 확인
    existing = table.get_item(Key={"pk": str(pk), "character_id": char_id}).get("Item")
    if not existing:
        # 새로운 캐릭터 저장
        table.put_item(Item={
            "pk": str(pk),
            "character_id": char_id,
            "is_unlocked": True,
            "unlocked_at": datetime.now(KST).isoformat()
        })
        new = True
    else:
        new = False

    # 별사탕 차감
    stat_table.update_item(
        Key={"pk": str(pk)},
        UpdateExpression="SET star_candy = star_candy - :val",
        ExpressionAttributeValues={":val": 1}
    )

    return {
        "character_id": char_id,
        "rarity": rarity,
        "message": "이미 보유한 캐릭터입니다." if not new else "캐릭터를 획득했습니다!",
        "new": new
    }


def get_user_stats(pk: int) -> dict:
    result = stat_table.get_item(Key={"pk": str(pk)})
    return result.get("Item")



def get_all_characters() -> list:
    characters_table = boto3.resource("dynamodb").Table("Characters")
    response = characters_table.scan()
    return response.get("Items", [])



def get_user_character_collection(pk: int) -> list:
    # 전체 캐릭터 불러오기
    characters_table = boto3.resource("dynamodb").Table("Characters")
    all_chars_resp = characters_table.scan()
    all_characters = all_chars_resp.get("Items", [])

    # 유저가 보유한 캐릭터 ID 조회
    owned_resp = table.query(
        KeyConditionExpression=boto3.dynamodb.conditions.Key("pk").eq(str(pk))
    )
    owned_ids = set(str(item["character_id"]) for item in owned_resp.get("Items", []))

    # 통합 결과 생성
    result = []
    for char in all_characters:
        result.append({
            "character_id": char["character_id"],
            "name": char["name"],
            "description": char["description"],
            "rarity": char["rarity"],
            "image_url": char["image_url"],
            "category": char["category"],
            "unlocked": str(char["character_id"]) in owned_ids
        })

    return result

