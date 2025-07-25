from fastapi import APIRouter, HTTPException
from .character_models import CharacterUnlockRequest, CharacterUnlockResponse
from .character_service import unlock_random_character, get_user_stats

router = APIRouter(prefix="/character", tags=["Character"])

@router.post("/unlock-random", response_model=CharacterUnlockResponse)
def unlock_random(req: CharacterUnlockRequest):
    result = unlock_random_character(req.pk)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

# ✅ 별사탕, 채팅 수 조회 API
@router.get("/user-stats/{pk}")
def get_stats(pk: int):
    stats = get_user_stats(pk)
    if not stats:
        raise HTTPException(status_code=404, detail="유저 통계 정보를 찾을 수 없습니다.")
    return stats


@router.get("/collection/{pk}")
def get_user_collection(pk: int):
    from .character_service import get_user_character_collection
    return get_user_character_collection(pk)


# 전체 캘기터 목록 조회
@router.get("/all")
def get_all_characters():
    from .character_service import get_all_characters
    return get_all_characters()
