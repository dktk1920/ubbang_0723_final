from sqlalchemy.orm import Session
from MySql.models import User
from typing import Optional
from sqlalchemy.orm import Session


def store_refresh_token_to_db(user: User, refresh_token: str, db: Session):
    """
    리프레시 토큰을 User 테이블에 저장합니다.
    """
    user.refresh_token = refresh_token
    db.commit()
    print(f"[🔐 저장 완료] refresh_token 저장 (user_pk={user.pk})")


def get_refresh_token_from_db(user_pk: int, db: Session) -> Optional[str]:
    """
    DB에서 해당 유저의 리프레시 토큰을 조회합니다.
    """
    user = db.query(User).filter(User.pk == user_pk).first()
    if user:
        print(f"[📥 조회 완료] user:{user_pk} → refresh_token 존재 여부: {'✅ 있음' if user.refresh_token else '❌ 없음'}")
        return user.refresh_token
    print(f"[❌ 유저 없음] user:{user_pk}")
    return None


def delete_refresh_token(user_pk: int, db: Session):
    """
    로그아웃 등으로 리프레시 토큰을 삭제합니다.
    """
    user = db.query(User).filter(User.pk == user_pk).first()
    if user:
        user.refresh_token = None
        db.commit()
        print(f"[🧹 삭제 완료] user:{user_pk} → refresh_token 삭제됨")


def get_refresh_token_from_db(user_pk: int, db: Session) -> Optional[str]:
    user = db.query(User).filter(User.pk == user_pk).first()
    return user.refresh_token if user else None
