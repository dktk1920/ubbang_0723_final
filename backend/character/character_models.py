from pydantic import BaseModel
from typing import Literal, List


# ✅ 캐릭터 정보 기본 모델 (DynamoDB에 저장될 캐릭터 한 개의 구조)
class CharacterModel(BaseModel):
    character_id: str  # "1" ~ "40"
    name: str
    description: str
    rarity: Literal["common", "rare", "epic", "legendary"]
    image_url: str  # 예: "/images/breads/xxx.png"
    category: Literal["sweet", "savory", "special"]


# ✅ 캐릭터 뽑기 요청 (POST /character/unlock-random)
class CharacterUnlockRequest(BaseModel):
    pk: int  # 유저 고유 pk (int)


# ✅ 캐릭터 뽑기 응답
class CharacterUnlockResponse(BaseModel):
    character_id: int                # 뽑힌 캐릭터 ID
    rarity: str                      # 뽑힌 캐릭터 등급
    message: str                     # 프론트에 띄울 안내 메시지
    new: bool                        # 이미 보유한 캐릭터인지 여부


# ✅ 전체 캐릭터 목록 응답 (GET /character/list 등)
class CharacterListResponse(BaseModel):
    characters: List[CharacterModel]
