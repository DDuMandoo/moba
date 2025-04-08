import os
import requests
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()
BANK_SERVER_URL = os.getenv("BANK_SERVER_URL")

def get_receipts_from_bank(user_id: int) -> List[Dict]:
    try:
        url = f"{BANK_SERVER_URL}/{user_id}/receipt"

        response = requests.post(url)
        if response.status_code != 200:
            raise Exception(f"[Bank API Error] 상태코드: {response.status_code} / 내용: {response.text}")

        json_data = response.json()

        if not json_data.get("isSuccess") or "result" not in json_data:
            raise Exception("은행 서버 응답에 result 필드가 없거나 실패")

        receipts = json_data["result"]

        formatted = [
            {
                "소분류": r["subCategory"],
                "금액": r["amount"],
                "대분류": r.get("category"),
                "결제시간": r.get("payedAt")
            }
            for r in receipts
            if r.get("subCategory") and r.get("amount")
        ]

        return formatted

    except Exception as e:
        raise RuntimeError(f"은행 서버 영수증 조회 실패: {e}")