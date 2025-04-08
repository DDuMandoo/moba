import os
import time
import pandas as pd
from multiprocessing import Process
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from bs4 import BeautifulSoup

# 기본 설정
base_dir = os.path.dirname(__file__)
INPUT_PATH = os.path.join(base_dir, "seoul_gyeongi_final_place.csv")
OUTPUT_PATH = os.path.join(base_dir, "seoul_gyeongi_final_place_with_rating.csv")
TEMP_DIR = os.path.join(base_dir, "temp_chunks")
CHROME_DRIVER_PATH = r"C:/Users/SSAFY/Downloads/chromedriver.exe"

os.makedirs(TEMP_DIR, exist_ok=True)

# 크롬 드라이버 실행

def get_driver():
    options = Options()
    options.add_argument('--headless')
    options.add_argument('lang=ko_KR')
    options.add_argument("user-agent=Mozilla/5.0")
    service = Service(executable_path=CHROME_DRIVER_PATH)
    return webdriver.Chrome(service=service, options=options)

# 별점, 리뷰수 추출

def extract_rating_review(driver, url):
    try:
        driver.get(url)
        time.sleep(1.2)
        soup = BeautifulSoup(driver.page_source, "html.parser")
        rating_tag = soup.select_one("span.num_star")
        rating = rating_tag.text.strip() if rating_tag else ""
        review_tag = soup.select_one("span.info_num")
        review = review_tag.text.strip() if review_tag else ""
        return rating, review
    except Exception as e:
        print(f"❌ {url} - {e}")
        return "", ""

# 개별 프로세스 함수

def worker(start, end, chunk, idx):
    driver = get_driver()
    ratings = []
    reviews = []

    for i, row in chunk.iterrows():
        url = row["카카오URL"]
        rating, review = extract_rating_review(driver, url)
        ratings.append(rating)
        reviews.append(review)

    chunk["별점"] = ratings
    chunk["리뷰수"] = reviews
    chunk.to_csv(os.path.join(TEMP_DIR, f"chunk_{idx}_{start}_{end}.csv"), index=False, encoding="utf-8-sig")
    driver.quit()

# 한 번에 10,000개씩 처리

def process_chunk(chunk_df, chunk_idx):
    print(f"\n🚀 Chunk {chunk_idx} 시작 ({len(chunk_df)}개)")
    chunk_size = len(chunk_df) // 10 + 1
    processes = []

    for i in range(0, len(chunk_df), chunk_size):
        start = i
        end = min(i + chunk_size, len(chunk_df))
        sub_chunk = chunk_df.iloc[start:end].copy()
        p = Process(target=worker, args=(start, end, sub_chunk, chunk_idx))
        p.start()
        processes.append(p)

    for p in processes:
        p.join()

    # 결과 병합
    part_files = [os.path.join(TEMP_DIR, f) for f in os.listdir(TEMP_DIR) if f.startswith(f"chunk_{chunk_idx}_")]
    result_list = [pd.read_csv(f) for f in part_files]
    combined = pd.concat(result_list)
    combined.to_csv(os.path.join(TEMP_DIR, f"result_chunk_{chunk_idx}.csv"), index=False, encoding="utf-8-sig")

    # 임시 파일 삭제
    for f in part_files:
        os.remove(f)

# 전체 실행

def run_batches():
    df = pd.read_csv(INPUT_PATH, encoding="cp949", low_memory=False)
    total = len(df)
    chunk_unit = 10000

    for i in range(0, total, chunk_unit):
        chunk_df = df.iloc[i:i+chunk_unit].copy()
        chunk_idx = i // chunk_unit
        process_chunk(chunk_df, chunk_idx)

    # 전체 병합
    result_files = [os.path.join(TEMP_DIR, f) for f in os.listdir(TEMP_DIR) if f.startswith("result_chunk_")]
    full_df = pd.concat([pd.read_csv(f) for f in result_files])
    full_df.to_csv(OUTPUT_PATH, index=False, encoding="utf-8-sig")
    print("\n✅ 전체 병합 완료")

if __name__ == "__main__":
    run_batches()
