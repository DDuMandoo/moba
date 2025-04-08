import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os


# 한글 폰트 설정 (Mac: 'AppleGothic', Windows: 'Malgun Gothic', Colab: Nanum)
plt.rc('font', family='Malgun Gothic')
plt.rcParams['axes.unicode_minus'] = False

# 파일 경로 설정
base_dir = os.path.dirname(__file__)
file_path = os.path.join(base_dir, "dummy_receipts_updated.csv")

# 데이터 불러오기
df = pd.read_csv(file_path)

# 1. 페르소나별 영수증 수
plt.figure(figsize=(10, 6))
top_personas = df['페르소나'].value_counts().nlargest(20)
sns.barplot(x=top_personas.values, y=top_personas.index)
plt.title("상위 20개 페르소나별 영수증 수")
plt.xlabel("영수증 수")
plt.ylabel("페르소나")
plt.tight_layout()
plt.show()

# 2. 소분류별 영수증 수
plt.figure(figsize=(10, 6))
top_subcats = df['소분류'].value_counts().nlargest(20)
sns.barplot(x=top_subcats.values, y=top_subcats.index)
plt.title("상위 20개 소분류별 영수증 수")
plt.xlabel("영수증 수")
plt.ylabel("소분류")
plt.tight_layout()
plt.show()

# 3. 가격 분포
plt.figure(figsize=(8, 5))
sns.histplot(df['금액'], bins=50, kde=True)
plt.title("결제 금액 분포")
plt.xlabel("금액")
plt.ylabel("건수")
plt.tight_layout()
plt.show()

# 4. 월별 영수증 수
df["결제일시"] = pd.to_datetime(df["결제일시"])
df["월"] = df["결제일시"].dt.to_period("M").astype(str)

plt.figure(figsize=(10, 6))
sns.countplot(x="월", data=df.sort_values("월"))
plt.xticks(rotation=45)
plt.title("월별 영수증 생성 수")
plt.xlabel("월")
plt.ylabel("영수증 수")
plt.tight_layout()
plt.show()
