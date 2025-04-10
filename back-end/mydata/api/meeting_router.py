from fastapi import APIRouter, HTTPException
from mydata.service.meeting_service import analyze_group_interests
from mydata.schemas.recommend_request import TokenListRequest

router = APIRouter()

@router.post("/group/analyze")
def group_interest_analysis(request: TokenListRequest):
    return analyze_group_interests(request.tokens)
