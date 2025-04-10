from pydantic import BaseModel
from typing import List

class TokenListRequest(BaseModel):
    tokens: List[str]
