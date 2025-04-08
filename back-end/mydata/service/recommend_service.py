import pandas as pd
import numpy as np
from surprise import Dataset, Reader
from joblib import load
from mydata.db.recommend_repository import save_full_recommendation, get_latest_recommendation
import os
from datetime import datetime, timedelta, timezone

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "../recommendation/svd_model.joblib")
ITEM_SIM_PATH = os.path.join(BASE_DIR, "../recommendation/item_similarity.joblib")
item_sim_df = load(ITEM_SIM_PATH)

def hybrid_recommend_from_receipts(receipts: list, user_id: int, top_n=10, alpha=0.8):
    if not receipts:
        raise ValueError("영수증 데이터가 비어 있습니다.")

    df = pd.DataFrame(receipts)
    print(df.columns)

    # 컬럼 변환: 영어 → 한글로 맵핑
    df = df.rename(columns={
        "receiptId": "영수증ID",
        "placeId": "장소ID",
        "placeName": "장소명",
        "category": "대분류",
        "subCategory": "소분류",
        "amount": "금액",
        "payedAt": "결제시간"
    })

    # 사용자 ID 추가
    df["사용자ID"] = user_id

    # 추천 알고리즘 준비용 group
    df_grouped = df.groupby(["사용자ID", "소분류"]).size().reset_index(name="횟수")
    reader = Reader(rating_scale=(df_grouped["횟수"].min(), df_grouped["횟수"].max()))
    data = Dataset.load_from_df(df_grouped[["사용자ID", "소분류", "횟수"]], reader)
    trainset = data.build_full_trainset()

    model = load(MODEL_PATH)
    model.fit(trainset)

    all_items = item_sim_df.columns.tolist()
    user_items = df_grouped[df_grouped["사용자ID"] == user_id]["소분류"].tolist()

    cf_scores, cb_scores = {}, {}

    for item in all_items:
        if item in user_items:
            continue
        try:
            cf_scores[item] = model.predict(str(user_id), item).est
        except:
            cf_scores[item] = 0

        sims = [
            item_sim_df.loc[item, used_item]
            for used_item in user_items
            if used_item in item_sim_df.columns and item in item_sim_df.index
        ]
        cb_scores[item] = np.mean(sims) if sims else 0

    hybrid_scores = {
        item: alpha * cf_scores.get(item, 0) + (1 - alpha) * cb_scores.get(item, 0)
        for item in cf_scores
    }

    sorted_items = sorted(hybrid_scores.items(), key=lambda x: x[1], reverse=True)
    recommendations = [{"소분류": item, "score": round(score, 3)} for item, score in sorted_items]
    
    # 시간대별 소비량
    df["결제시간"] = pd.to_datetime(df["결제시간"])
    df["시간대"] = df["결제시간"].dt.hour
    hourly_stats = df.groupby("시간대")["금액"].sum().to_dict()

    # 대분류별 소분류 Top 10 소비 비율
    category_price_ratio = {}
    for major, group in df.groupby("대분류"):
        sub_group = group.groupby("소분류")["금액"].sum().sort_values(ascending=False).head(10)
        total_major_amount = sub_group.sum()
        category_price_ratio[major] = {
            sub: round(amount / total_major_amount * 100, 2)
            for sub, amount in sub_group.items()
        }

    # 대분류별 소분류 영수증 개수 비율
    category_count_ratio = {}
    for major, group in df.groupby("대분류"):
        sub_group = group.groupby("소분류").size().sort_values(ascending=False).head(10)
        total_count = sub_group.sum()
        category_count_ratio[major] = {
            sub: round(count / total_count * 100, 2)
            for sub, count in sub_group.items()
        }


    # 페르소나 한 줄 설명
    top_major = df.groupby("대분류")["금액"].sum().idxmax()
    persona = f"{top_major} 관련 소비가 가장 많아요!"

    # MongoDB 저장
    result = save_full_recommendation(
        user_id=user_id,
        recommendations=recommendations,
        hourly_stats=hourly_stats,
        category_price_ratio=category_price_ratio,
        category_count_ratio=category_count_ratio,
        persona=persona
    )
    return result

# 기존 유저를 위해 한달 지났는지 알려주는 함수
def is_recommendation_expired(user_id: int) -> bool:
    latest = get_latest_recommendation(user_id)
    if not latest:
        return True
    timestamp_str = latest.get("timestamp")
    if not timestamp_str:
        return True
    try:
        timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
        return datetime.now(timezone.utc) - timestamp > timedelta(days=30)
    except Exception:
        return True

