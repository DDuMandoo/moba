from datetime import datetime, timedelta
from jose import jwt, JWTError
from mydata.db.mongo import user_collection
import os
from dotenv import load_dotenv

# 환경변수
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    raise RuntimeError("환경 변수 확인해주세요.")
ALGORITHM = "HS256"
ACCESS_EXPIRE_MINUTES = 30 * 24 * 60    # 30일
REFRESH_EXPIRE_MINUTES = 365 * 24 * 60  # 1년

# 사용자 로직
def get_user(user_id: int):
    return user_collection.find_one({"user_id": user_id})

def ensure_user_exists(user_id: int):
    if not get_user(user_id):
        user_collection.insert_one({
            "user_id": user_id,
            "last_updated": datetime.now()
        })

def update_last_updated(user_id: int):
    user_collection.update_one(
        {"user_id": user_id},
        {"$set": {"last_updated": datetime.now()}}
    )

def create_access_token(user_id: int):
    now = datetime.utcnow()
    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": now + timedelta(minutes=ACCESS_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_access_token(token: str) -> int:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "access":
            raise JWTError("Invalid token type")
        return int(payload.get("sub"))
    except JWTError:
        raise ValueError("Invalid or expired token")
