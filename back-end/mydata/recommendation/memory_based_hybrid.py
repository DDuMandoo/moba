import pandas as pd
import numpy as np
import os
from surprise import Dataset, Reader, KNNBasic, accuracy
from surprise.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity

# ---------------------- 1. 데이터 로딩 ----------------------
base_dir = os.path.dirname(__file__)
dummy_data = os.path.join(base_dir, "../transaction/transaction_dataset/dummy_receipts.csv")
df = pd.read_csv(dummy_data, encoding="utf-8-sig")

# 유저-소분류 기준 영수증 개수
df_grouped = df.groupby(["사용자ID", "소분류"]).size().reset_index(name="횟수")

# ---------------------- 2. Surprise Dataset 생성 ----------------------
reader = Reader(rating_scale=(df_grouped["횟수"].min(), df_grouped["횟수"].max()))
data = Dataset.load_from_df(df_grouped[["사용자ID", "소분류", "횟수"]], reader)
trainset, testset = train_test_split(data, test_size=0.25, random_state=42)

# ---------------------- 3. 협업 필터링 모델 학습 ----------------------
sim_options = {
    "name": "cosine",
    "user_based": False
}
model = KNNBasic(sim_options=sim_options)
model.fit(trainset)

# 협업 필터링 예측 결과 저장
predictions = model.test(testset)
cf_dict = {(pred.uid, pred.iid): pred.est for pred in predictions}

# ---------------------- 4. 컨텐츠 기반 유사도 계산 ----------------------
pivot = df.pivot_table(index="사용자ID", columns="소분류", values="금액", aggfunc="mean", fill_value=0)
item_sim_df = pd.DataFrame(
    cosine_similarity(pivot.T),
    index=pivot.columns,
    columns=pivot.columns
)

# ---------------------- 5. alpha 별 성능 측정 ----------------------
def evaluate_alpha(alpha):
    hybrid_errors = []
    for pred in predictions:
        user_id, item_id = pred.uid, pred.iid
        cf_score = pred.est

        # 컨텐츠 기반 점수
        user_items = df_grouped[df_grouped["사용자ID"] == int(user_id)]["소분류"].tolist()
        sims = [
            item_sim_df.loc[item_id, used_item]
            for used_item in user_items
            if used_item in item_sim_df.columns and item_id in item_sim_df.index
        ]
        cb_score = np.mean(sims) if sims else 0

        hybrid_score = alpha * cf_score + (1 - alpha) * cb_score
        hybrid_errors.append(abs(hybrid_score - pred.r_ui))  # 실제 rating과의 차이

    return np.mean(hybrid_errors)

# alpha = 0.0 ~ 1.0 까지 실험
alphas = np.arange(0.0, 1.05, 0.1)
results = {round(a, 2): evaluate_alpha(a) for a in alphas}

best_alpha = min(results, key=results.get)
print("✅ alpha별 평균 오차:")
for a, score in results.items():
    print(f"alpha = {a:.2f} → 평균 MAE 유사도 차이: {score:.4f}")

print(f"\n🔥 최적 alpha: {best_alpha:.2f} (오차: {results[best_alpha]:.4f})") # alpha = 0.6, mae=0.9181
