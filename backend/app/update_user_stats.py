# 캐릭터 수집 위해서 .. 유저 채팅횟수 수집하는 코드

# app/update_user_stats.py

import boto3

dynamodb = boto3.resource("dynamodb")
stat_table = dynamodb.Table("UserStats")

def increment_chat_count(pk: int):
    """chat_count 증가 및 5의 배수일 때 star_candy 지급"""
    # 기존 값 조회
    res = stat_table.get_item(Key={"pk": str(pk)})
    stats = res.get("Item")

    if not stats:
        # 초기값 없는 경우 에러 로그만
        print(f"[WARN] UserStats 없음: pk={pk}")
        return

    current_count = stats.get("chat_count", 0)
    new_count = current_count + 1

    # star_candy 지급 여부 판단
    update_expr = "SET chat_count = :cc"
    expr_vals = {":cc": new_count}

    if new_count % 5 == 0:
        update_expr += ", star_candy = star_candy + :sc"
        expr_vals[":sc"] = 1

    stat_table.update_item(
        Key={"pk": str(pk)},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_vals
    )
