import pandas as pd
import numpy as np
import os
from surprise import Dataset, Reader, SVDpp, accuracy
from surprise.model_selection import train_test_split
from sklearn.metrics.pairwise import cosine_similarity

# 1. 데이터 로딩
base_dir = os.path.dirname(__file__)
dummy_data = os.path.join(base_dir, "../transaction/transaction_dataset/dummy_receipts.csv")
df = pd.read_csv(dummy_data, encoding="utf-8-sig")

df_grouped = df.groupby(["사용자ID", "소분류"]).size().reset_index(name="횟수")

# 2. Surprise Dataset
reader = Reader(rating_scale=(df_grouped["횟수"].min(), df_grouped["횟수"].max()))
data = Dataset.load_from_df(df_grouped[["사용자ID", "소분류", "횟수"]], reader)
trainset, testset = train_test_split(data, test_size=0.25, random_state=42)

# 3. SVDpp 학습
model = SVDpp()
model.fit(trainset)

# 예측
predictions = model.test(testset)

# 4. 컨텐츠 기반 유사도
pivot = df.pivot_table(index="사용자ID", columns="소분류", values="금액", aggfunc="mean", fill_value=0)
item_sim_df = pd.DataFrame(
    cosine_similarity(pivot.T),
    index=pivot.columns,
    columns=pivot.columns
)

# 5. alpha 최적화
def evaluate_alpha(alpha):
    hybrid_errors = []
    for pred in predictions:
        user_id, item_id = pred.uid, pred.iid
        cf_score = pred.est
        user_items = df_grouped[df_grouped["사용자ID"] == int(user_id)]["소분류"].tolist()
        sims = [item_sim_df.loc[item_id, used] for used in user_items
                if item_id in item_sim_df.index and used in item_sim_df.columns]
        cb_score = np.mean(sims) if sims else 0
        hybrid_score = alpha * cf_score + (1 - alpha) * cb_score
        hybrid_errors.append(abs(hybrid_score - pred.r_ui))
    return np.mean(hybrid_errors)

alphas = np.arange(0.0, 1.05, 0.1)
results = {round(a, 2): evaluate_alpha(a) for a in alphas}
best_alpha = min(results, key=results.get)

print("✅ [SVDpp] alpha 별 MAE:")
for a, score in results.items():
    print(f"alpha = {a:.2f} → MAE: {score:.4f}")
print(f"\n🔥 최적 alpha: {best_alpha:.2f} (MAE: {results[best_alpha]:.4f})")
