
from jose import jwt

token = jwt.encode({"sub": "test"}, "my-secret", algorithm="HS256")
print("✅ JWT 생성 성공:", token)

decoded = jwt.decode(token, "my-secret", algorithms=["HS256"])
print("✅ JWT 디코딩 성공:", decoded)


