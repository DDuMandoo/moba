import pandas as pd
import numpy as np
import random
from faker import Faker
from collections import defaultdict
import os

# ------------------- 설정 -------------------
fake = Faker("ko_KR")
random.seed(42)
np.random.seed(42)

# 파일 경로 설정
base_dir = os.path.dirname(__file__)
place_file = os.path.join(base_dir, "../place/place_dataset/seoul_gyeongi_final_place.csv")
persona_map_file = os.path.join(base_dir, "transaction_dataset/persona_categories_mapped.csv")
subcat_count_file = os.path.join(base_dir, "../place/place_dataset/categories_place_count.csv")

# 파라미터
NUM_USERS = 10000
RECEIPTS_PER_USER = 100
START_USER_ID = 1
MAX_RECEIPTS_PER_PLACE = 30

# ------------------- 페르소나 정의 -------------------
A = ["A1", "A2", "A3", "A4"]
B = ["B1", "B2", "B3", "B4", "B5"]
C = ["C1", "C2", "C3", "C4", "C5"]
D = ["D1", "D2", "D3", "D4", "D5"]
E = ["E1", "E2", "E3"]
personas = [f"{a}-{b}-{c}-{d}-{e}" for a in A for b in B for c in C for d in D for e in E]

# 가격 구간 비율 및 최대 금액 한도
persona_C_config = {
    "C1": {"ratios": [0.9, 0.1, 0.0], "max": 300000},
    "C2": {"ratios": [0.3, 0.6, 0.1], "max": 3000000},
    "C3": {"ratios": [0.2, 0.4, 0.4], "max": None},
    "C4": {"ratios": [0.3, 0.6, 0.1], "max": None},
    "C5": {"ratios": [0.3, 0.6, 0.1], "max": 3000000},
}

persona_A_limit = {
    "A1": 1000000,
    "A2": 5000000,
    "A3": None,
    "A4": None
}

# ------------------- 데이터 로딩 -------------------
place_df = pd.read_csv(place_file, encoding="cp949")
persona_mapping_df = pd.read_csv(persona_map_file, encoding="cp949")
subcategory_count_df = pd.read_csv(subcat_count_file, encoding="cp949")

# ------------------- 매핑 구조 생성 -------------------
subcategory_to_places = defaultdict(list)
subcategory_place_count = defaultdict(int)
subcategory_price_range = {}
subcategory_main_category = {}

for _, row in persona_mapping_df.iterrows():
    subcat = row["세부분류"]
    subcategory_price_range[subcat] = (int(row["저가하한"]), int(row["고가상한"]))
    subcategory_main_category[subcat] = row["카테고리"]

# 장소 연결
for _, row in place_df.iterrows():
    subcat = row["세부분류"]
    subcategory_to_places[subcat].append(row)
    subcategory_place_count[subcat] += 1

# 소분류 ↔ 페르소나 매핑
subcategory_to_personas = defaultdict(list)
for _, row in persona_mapping_df.iterrows():
    subcat = row["세부분류"]
    for col in ["Top1", "Top2", "Top3", "Top4", "Top5"]:
        if pd.notna(row[col]):
            subcategory_to_personas[subcat].append(row[col])

# 소분류 가중치 (장소 수 기준)
subcat_weights = {}
for _, row in subcategory_count_df.iterrows():
    subcat = row["세부분류"]
    count = row["장소 수"]
    subcat_weights[subcat] = np.log1p(count)

# ------------------- 유틸 함수 -------------------
def generate_price(price_min, price_max, ratio):
    # 가격대 세 구간 정의
    low = (price_min, min(price_min + 100000, price_max))
    mid = (low[1], min(price_min + 500000, price_max))
    high = (mid[1], price_max)

    ranges = [low, mid, high]
    price_range = random.choices(ranges, weights=ratio, k=1)[0]

    # 상한을 초과하지 않도록 b를 포함하지 않는 randint -> randrange 사용
    start = price_range[0]
    end = price_range[1]
    if end <= start:
        return start  # 최소와 최대가 같으면 그대로 반환
    return random.randrange(start, end, 100)  # 100원 단위로 잘라줌

def generate_datetime():
    return fake.date_time_between(start_date="-1y", end_date="now")

def pick_subcategory_for_persona(persona):
    candidates = [sub for sub, plist in subcategory_to_personas.items() if persona in plist]
    weights = [subcat_weights.get(sub, 0.1) for sub in candidates]
    return random.choices(candidates, weights=weights, k=1)[0] if candidates else None

# ------------------- 영수증 생성 -------------------
receipt_rows = []
receipt_id = 1
user_personas = {uid: random.choice(personas) for uid in range(START_USER_ID, START_USER_ID + NUM_USERS)}
place_receipt_counts = defaultdict(int)

for user_id in range(START_USER_ID, START_USER_ID + NUM_USERS):
    persona = user_personas[user_id]
    A_type, _, C_type, _, _ = persona.split("-")
    C_cfg = persona_C_config[C_type]
    A_limit = persona_A_limit[A_type]

    for _ in range(RECEIPTS_PER_USER):
        matched = False
        for tag in persona.split("-"):
            subcat = pick_subcategory_for_persona(tag)
            if not subcat or subcat not in subcategory_to_places:
                continue

            price_min, price_max = subcategory_price_range.get(subcat, (5000, 50000))
            if C_cfg["max"]:
                price_max = min(price_max, C_cfg["max"])
            if A_limit:
                price_max = min(price_max, A_limit)

            main_cat = subcategory_main_category.get(subcat, "")
            place_candidates = subcategory_to_places[subcat]

            if main_cat in ["음식", "카페·디저트", "술집"]:
                weights = [np.log1p(1 + int(p.get("리뷰수", 0))) for p in place_candidates]
                place = random.choices(place_candidates, weights=weights, k=1)[0]
            else:
                random.shuffle(place_candidates)

            for place in place_candidates:
                key = (subcat, place["상호명"], place["도로명주소"])
                per_place_limit = min(subcategory_place_count[subcat] * 2, MAX_RECEIPTS_PER_PLACE)
                if place_receipt_counts[key] < per_place_limit:
                    place_receipt_counts[key] += 1
                    receipt_rows.append({
                        "영수증ID": receipt_id,
                        "사용자ID": user_id,
                        "페르소나": persona,
                        "대분류": main_cat,
                        "소분류": subcat,
                        "결제일시": generate_datetime(),
                        "금액": generate_price(price_min, price_max, C_cfg["ratios"]),
                        "장소명": place["상호명"],
                        "주소": place["도로명주소"],
                        "위도": place["위도"],
                        "경도": place["경도"],
                        "카카오URL": place["카카오URL"]
                    })
                    receipt_id += 1
                    matched = True
                    break
            if matched:
                break

# ------------------- 저장 -------------------
df = pd.DataFrame(receipt_rows)
df.to_csv(os.path.join(base_dir, "transaction_dataset/dummy_receipts.csv"), index=False, encoding="utf-8-sig")
print(f"✅ 총 {len(df)}개의 영수증이 생성되었습니다.")
