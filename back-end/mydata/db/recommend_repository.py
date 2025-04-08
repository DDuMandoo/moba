from mydata.db.mongo import recommend_collection
from datetime import datetime, timezone
from typing import List, Dict

def save_full_recommendation(
    user_id: int,
    recommendations: List[Dict],
    hourly_stats: Dict,
    category_price_ratio: Dict,
    category_count_ratio: Dict,
    persona: str
):
    # 숫자 key → 문자열 변환 (MongoDB 키 제약 대응)
    hourly_stats_str = {str(k): v for k, v in hourly_stats.items()}

    category_price_ratio_str = {
        major: {str(sub): v for sub, v in sub_ratio.items()}
        for major, sub_ratio in category_price_ratio.items()
    }

    category_count_ratio_str = {
        major: {str(sub): v for sub, v in sub_ratio.items()}
        for major, sub_ratio in category_count_ratio.items()
    }

    result = {
        "user_id": user_id,
        "recommendations": recommendations,
        "hourly_stats": hourly_stats_str,
        "category_price_ratio": category_price_ratio_str,
        "category_count_ratio": category_count_ratio_str,
        "persona_summary": persona,
        "timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
    }

    recommend_collection.insert_one(result)
    return result

def get_latest_recommendation(user_id: int):
    return recommend_collection.find_one(
        {"user_id": user_id},
        sort=[("timestamp", -1)]
    )
