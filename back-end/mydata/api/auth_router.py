from fastapi import APIRouter, HTTPException
from mydata.utils.jwt_utils import create_access_token

router = APIRouter()

@router.post("/token")
def issue_token(user_id: int):
    access_token = create_access_token(user_id)
    return {"access_token": access_token, "token_type": "bearer"}
