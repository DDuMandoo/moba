from jose import jwt, JWTError
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# 설정 값
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("환경 변수 JWT_SECRET_KEY가 설정되어 있지 않습니다.")

ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = 30 * 24 * 60  # 30일

# Access Token 생성
def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": expire
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

# Access Token 검증
def verify_access_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("@@@@@@@@@@@@payload", payload)

        if payload.get("type") != "access":
            raise JWTError("유효하지 않은 토큰 유형입니다.")

        user_id = payload.get("sub")
        if user_id is None:
            raise JWTError("user_id가 없습니다.")

        return int(user_id)

    except JWTError:
        raise ValueError("유효하지 않은 또는 만료된 토큰입니다.")
