from fastapi import APIRouter, Header, HTTPException
from mydata.db.user_repository import ensure_user_exists
from mydata.service.bank_service import get_receipts_from_bank
from mydata.service.recommend_service import hybrid_recommend_from_receipts
from mydata.db.recommend_repository import get_latest_recommendation
from mydata.utils.mongo_utils import convert_mongo_document
from mydata.utils.jwt_utils import create_access_token, verify_access_token  # ✅ 여기로 통일

router = APIRouter()

# 최초 인증 시
@router.post("/init")
def init_user(user_id: int):
    ensure_user_exists(user_id)

    # 은행에서 영수증 수집
    receipts = get_receipts_from_bank(user_id)
    result = hybrid_recommend_from_receipts(receipts, user_id)

    # 토큰 생성
    access_token = create_access_token(user_id)
    print("init @@@@@ access token@@@@@@", access_token)
    return {
        "access_token": access_token,
        "result": convert_mongo_document(result)
    }

# 최초 인증이 아닐 때
@router.get("/info")
def get_user_data(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=4010, detail="Bearer 헤더만 허용됩니다.")

    token = authorization.split(" ")[1]
    print("info @@@@@ access token@@@@@@", token)
    try:
        user_id = verify_access_token(token)
    except ValueError:
        raise HTTPException(status_code=4011, detail="RE_AUTH_REQUIRED")

    result = get_latest_recommendation(user_id)
    if not result:
        raise HTTPException(status_code=4040, detail="분석 결과가 없습니다.")

    return convert_mongo_document(result)
