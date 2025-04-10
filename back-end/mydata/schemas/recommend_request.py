from pydantic import BaseModel
from typing import List

class RecommendRequest(BaseModel):
    user_id: str

class TokenListRequest(BaseModel):
    tokens: List[str]

