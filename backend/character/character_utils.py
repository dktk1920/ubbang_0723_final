# 뽑기 확률계산 유틸함수 코드임다


import random

# 등급별 캐릭터 ID 목록
CHARACTER_DB = {
    "common": list(range(1, 17)),        # 1~16
    "rare": list(range(17, 29)),         # 17~28
    "epic": list(range(29, 37)),         # 29~36
    "legendary": list(range(37, 41))     # 37~40
}

# 등급별 확률 설정
RARITY_WEIGHTS = {
    "common": 0.5,
    "rare": 0.3,
    "epic": 0.16,
    "legendary": 0.04
}

# ✅ 캐릭터 뽑기 함수
def draw_random_character() -> tuple[int, str]:
    rarity = random.choices(
        population=list(RARITY_WEIGHTS.keys()),
        weights=list(RARITY_WEIGHTS.values()),
        k=1
    )[0]

    character_id = random.choice(CHARACTER_DB[rarity])
    return character_id, rarity
