# recommendation/precompute_item_similarity.py

import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity
from joblib import dump

# ---------------------- 1. 데이터 로딩 ----------------------
base_dir = os.path.dirname(__file__)
dummy_path = os.path.join(base_dir, "../dataset/transaction/transaction_dataset/dummy_receipts.csv")
output_path = os.path.join(base_dir, "item_similarity.joblib")

df = pd.read_csv(dummy_path, encoding="utf-8-sig")

# ---------------------- 2. pivot 및 유사도 계산 ----------------------
pivot = df.pivot_table(index="사용자ID", columns="소분류", values="금액", aggfunc="mean", fill_value=0)
item_sim_df = pd.DataFrame(
    cosine_similarity(pivot.T),
    index=pivot.columns,
    columns=pivot.columns
)

# ---------------------- 3. 저장 ----------------------
dump(item_sim_df, output_path)
print(f"✅ item_similarity.joblib 저장 완료: {output_path}")
