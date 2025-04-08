from pymongo import MongoClient

# Mongo 서버 주소 (테스트용 로컬 환경, TODO: 로컬 -> 배포 서버로 변경)
client = MongoClient("mongodb://localhost:27017")

# 사용할 데이터베이스
db = client["mydata_db"]

# 컬렉션 설정
user_collection = db["users"]                 # 사용자 인증/토큰 정보
recommend_collection = db["recommendations"]  # 추천 결과 저장
