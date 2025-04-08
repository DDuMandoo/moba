import pandas as pd
import numpy as np
import os
from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity
from joblib import dump, load

# ---------------------- 1. 데이터 로딩 ----------------------
base_dir = os.path.dirname(__file__)
dummy_data = os.path.join(base_dir, "../transaction/transaction_dataset/dummy_receipts.csv")
df = pd.read_csv(dummy_data, encoding="utf-8-sig")
df_grouped = df.groupby(["사용자ID", "소분류"]).size().reset_index(name="횟수")

# ---------------------- 2. Surprise Dataset 생성 ----------------------
reader = Reader(rating_scale=(df_grouped["횟수"].min(), df_grouped["횟수"].max()))
data = Dataset.load_from_df(df_grouped[["사용자ID", "소분류", "횟수"]], reader)
trainset, testset = train_test_split(data, test_size=0.25, random_state=42)

# ---------------------- 3. SVD 모델 학습 및 저장 ----------------------
model = SVD(n_factors=50, n_epochs=20, random_state=42)
model.fit(trainset)

# 저장
dump(model, os.path.join(base_dir, "svd_model.joblib"))

# 예측값 저장
predictions = model.test(testset)

# ---------------------- 4. 컨텐츠 기반 유사도 ----------------------
pivot = df.pivot_table(index="사용자ID", columns="소분류", values="금액", aggfunc="mean", fill_value=0)
item_sim_df = pd.DataFrame(
    cosine_similarity(pivot.T),
    index=pivot.columns,
    columns=pivot.columns
)

best_alpha = 0.8
# ---------------------- 7. 하이브리드 추천 함수 ----------------------
def hybrid_recommend(user_id, top_n=10, alpha=best_alpha):
    user_id = str(user_id)
    all_items = df["소분류"].unique()
    user_items = df_grouped[df_grouped["사용자ID"] == int(user_id)]["소분류"].tolist()

    cf_scores = {}
    cb_scores = {}

    for item in all_items:
        if item in user_items:
            continue

        try:
            pred = model.predict(user_id, item)
            cf_scores[item] = pred.est
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
    return sorted_items[:top_n]

# ---------------------- 8. 추천 1회만 출력 ----------------------
target_user = df["사용자ID"].sample(1).values[0]
print(f"\n사용자 {target_user} 추천 결과 (최적 alpha={best_alpha:.2f}):")
recommendations = hybrid_recommend(target_user)

for i, (item, score) in enumerate(recommendations, 1):
    print(f"{i}. {item} (점수: {score:.2f})")
