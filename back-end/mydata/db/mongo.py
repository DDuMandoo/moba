import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# 환경 변수로부터 값 읽기
mongo_host = os.getenv("MONGO_HOST", "localhost")
mongo_port = int(os.getenv("MONGO_PORT"))
mongo_db = os.getenv("MONGO_DB")

# 클라이언트 생성
client = MongoClient(host=mongo_host, port=mongo_port)

# 사용할 DB
db = client[mongo_db]

# 컬렉션
user_collection = db["users"]
recommend_collection = db["recommendations"]
