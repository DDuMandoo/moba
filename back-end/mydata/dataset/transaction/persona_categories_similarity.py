import pandas as pd
import numpy as np
import os
import re
from gensim.models import KeyedVectors
from sklearn.metrics.pairwise import cosine_similarity
from tqdm import tqdm

# ✅ 1. 현재 스크립트 경로 기준 설정
base_dir = os.path.dirname(os.path.abspath(__file__))

# ✅ 2. FastText 벡터 로드
model_path = os.path.join(base_dir, "cc.ko.300.kv")
print("📦 Gensim KeyedVectors 로딩 중...")
model = KeyedVectors.load(model_path)
print("✅ 모델 로딩 완료!")

# ✅ 3. 페르소나 설명 정의
persona_texts = {
    'A1': "10대 학생 학원 분식 패스트푸드 SNS 트렌드 또래문화 소액결제",
    'A2': "20대 직장인 자취 혼밥 배달 점심 식사 회사 가성비",
    'A3': "30~40대 가족 자녀 키즈카페 인테리어 체험 교육비",
    'A4': "중장년 건강 한식 여행 공연 오프라인 브랜드",
    'B1': "운동 헬스 단백질 고기 샐러드 밀키트",
    'B2': "해산물 회 조개 일식 랍스터 수산물 고급",
    'B3': "채식 웰빙 비건 유기농 저칼로리 친환경",
    'B4': "분식 도시락 패스트푸드 편의점 간편식 야식",
    'B5': "세계음식 멕시칸 태국 인도 퓨전 SNS 인증",
    'C1': "가성비 할인 쿠폰 중고 이월 적립",
    'C2': "프랜차이즈 대중 브랜드 평균 가심비",
    'C3': "프리미엄 명품 고급 외식 호텔 스파 골프",
    'C4': "SNS 핫플 트렌디 팝업 전시 한정판 굿즈",
    'C5': "홈카페 홈쿡 OTT 밀키트 집콕 배달 스트리밍",
    'D1': "레저 캠핑 등산 바다 계곡 모험 차박",
    'D2': "전시 미술관 공연 오페라 연극 문화예술",
    'D3': "게임 노래방 클럽 오락 VR 유흥",
    'D4': "공방 원데이클래스 자격증 자기계발 취미 학원",
    'E1': "1인 가구 혼밥 혼술 소포장 소형가구",
    'E2': "자녀 키즈카페 학원 유아용품 가족 놀이공원",
    'E3': "반려동물 강아지 고양이 펫 용품 미용"
}

def clean_and_tokenize(text):
    text = re.sub(r"[^\w\s]", " ", text)  # 특수문자 제거
    tokens = text.split()
    return tokens

# ✅ 4. 문장을 벡터로 변환하는 함수
def sentence_vector(sentence, model):
    tokens = clean_and_tokenize(sentence)
    vectors = [model[word] for word in tokens if word in model]
    return np.mean(vectors, axis=0) if vectors else np.zeros(model.vector_size)

# ✅ 5. 페르소나 벡터화
persona_vecs = {k: sentence_vector(v, model) for k, v in persona_texts.items()}

# ✅ 6. 소분류 데이터 불러오기
csv_path = os.path.join(base_dir, "categories.csv")
df = pd.read_csv(csv_path, encoding="cp949")  # or "utf-8" if needed

# ✅ 7. 유사도 기반 매핑
results = []

print("🔍 소분류별 페르소나 매핑 중...")
for _, row in tqdm(df.iterrows(), total=len(df)):
    text = f"{row['세부분류']} {row['연관도카테고리']} {row['카테고리']}"
    vec = sentence_vector(text, model)
    sims = {k: cosine_similarity([vec], [v])[0][0] for k, v in persona_vecs.items()}
    top5 = sorted(sims.items(), key=lambda x: x[1], reverse=True)[:5]

    results.append({
        '세부분류': row['세부분류'],
        '연관도카테고리': row['연관도카테고리'],
        '카테고리': row['카테고리'],
        'Top1': top5[0][0], 'Sim1': round(top5[0][1], 3),
        'Top2': top5[1][0], 'Sim2': round(top5[1][1], 3),
        'Top3': top5[2][0], 'Sim3': round(top5[2][1], 3),
        'Top4': top5[3][0], 'Sim4': round(top5[3][1], 3),
        'Top5': top5[4][0], 'Sim5': round(top5[4][1], 3),
    })

# ✅ 8. 결과 저장
output_path = os.path.join(base_dir, "persona_mapped_fasttext.csv")
pd.DataFrame(results).to_csv(output_path, index=False, encoding="utf-8")
print(f"📁 결과 저장 완료: {output_path}")
