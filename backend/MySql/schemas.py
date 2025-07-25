from pydantic import BaseModel, EmailStr
from datetime import date
from typing import Optional

# 회원가입용 스키마
class UserCreate(BaseModel):
    userId: str
    name: str
    password: str
    email: str
    birthDate: Optional[str] = None  # ✅ 문자열 하나 (선택사항)
    gender: str # "male" 또는 "female"
    mode: str # 반말, 존댓말모드
    worry: Optional[str] = None
    socialId: Optional[str] = None
    age: int
    tf: str
    pushEnabled: Optional[bool] = True   # 🔔 알림 설정 추가
    pushTime: Optional[str] = "20:00"    # ⏰ 알림 시간 추가


# 로그인 요청 스키마
class UserLogin(BaseModel):
    userId: str
    password: str

# 로그인 응답 스키마 (JWT 포함)
class UserLoginResponse(BaseModel):
    pk: int
    name: str
    userId: str
    gender: str
    mode: str
    worry: Optional[str] = None
    birthDate: Optional[str] = None
    loginMethod: str
    age: Optional[int] = None
    tf: str
    access_token: str       # ✅ 추가
    refresh_token: str      # ✅ 추가