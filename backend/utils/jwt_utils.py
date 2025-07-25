# jwt_utils.py
from jose import jwt
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from MySql.models import User
from sqlalchemy.orm import Session
from typing import Optional


load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 15))
REFRESH_TOKEN_EXPIRE_MINUTES = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", 10080))

# ✅ Access Token 생성
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ Refresh Token 생성
def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# ✅ JWT 디코드 및 검증
def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # 만료됨
    except jwt.JWTError:
        return None  # 잘못된 토큰

def store_refresh_token_to_db(user: User, refresh_token: str, db: Session):
    user.refresh_token = refresh_token
    db.commit()
    print(f"[🔐 저장] refresh_token → DB 저장 완료 (user: {user.pk})")

def get_refresh_token_from_db(user_pk: int, db: Session) -> Optional[str]:
    user = db.query(User).filter(User.pk == user_pk).first()
    return user.refresh_token if user else None
