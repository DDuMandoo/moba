import pandas as pd
import time
import re
import os
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from multiprocessing import Process, current_process

# 환경 설정
base_dir = os.path.dirname(__file__)
INPUT_CSV = os.path.join(base_dir, "seoul_gyeongi_final_place.csv")
OUTPUT_CSV = os.path.join(base_dir, "seoul_gyeongi_final_place_with_rating_TEST.csv")
CHROME_DRIVER_PATH = r"C:/Users/SSAFY/Downloads/chromedriver.exe"

# 셀레니움 드라이버 설정
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
        print(f"[{current_process().name}] ❌ {url} - {e}")
        return "", ""

def crawl_rating(start_idx, end_idx):
    print(f"[{current_process().name}] 🔥 시작! ({start_idx}~{end_idx})")

    df = pd.read_csv(INPUT_CSV, encoding="cp949", low_memory=False).iloc[:1000]
    print(f"[{current_process().name}] 📊 데이터 개수: {len(df)}")
    data_chunk = df.iloc[start_idx:end_idx].copy()
    print(f"[{current_process().name}] 🔁 크롤링 루프 시작 - {len(data_chunk)}개")

    driver = get_driver()
    ratings = []
    reviews = []

    for local_idx, (_, row) in enumerate(data_chunk.iterrows()):
        url = row["카카오URL"]
        print(f"[{current_process().name}] 🌐 {local_idx+1} / {len(data_chunk)} - {url}")
        rating, review = extract_rating_review(driver, url)
        ratings.append(rating)
        reviews.append(review)

        if (local_idx + 1) % 100 == 0:
            print(f"[{current_process().name}] ✅ {local_idx + 1}개 완료")

    data_chunk["별점"] = ratings
    data_chunk["리뷰수"] = reviews

    temp_path = os.path.join(base_dir, f"temp_TEST_{start_idx}_{end_idx}.csv")
    data_chunk.to_csv(temp_path, index=False, encoding="utf-8-sig")
    print(f"[{current_process().name}] 🎉 저장 완료: {temp_path}")

    driver.quit()

# 메인 함수
def parallel_rating_crawl_test():
    df = pd.read_csv(INPUT_CSV, encoding="cp949", low_memory=False).iloc[:1000]
    total = len(df)
    chunk_size = total // 8 + 1

    processes = []
    for i in range(0, total, chunk_size):
        start_idx = i
        end_idx = min(i + chunk_size, total)
        p = Process(target=crawl_rating, args=(start_idx, end_idx), name=f"Proc-{start_idx}-{end_idx}")
        processes.append(p)
        p.start()

    for p in processes:
        p.join()

    # 병합
    result_dfs = []
    for i in range(0, total, chunk_size):
        temp_path = os.path.join(base_dir, f"temp_TEST_{i}_{min(i+chunk_size, total)}.csv")
        if os.path.exists(temp_path):
            result_dfs.append(pd.read_csv(temp_path))
        else:
            print(f"⚠️ {temp_path} 없음!")

    if result_dfs:
        merged_df = pd.concat(result_dfs)
        merged_df.to_csv(OUTPUT_CSV, index=False, encoding="utf-8-sig")
        print(f"✅ 병합 완료: {OUTPUT_CSV}")

        # 임시 파일 삭제
        for i in range(0, total, chunk_size):
            os.remove(os.path.join(base_dir, f"temp_TEST_{i}_{min(i+chunk_size, total)}.csv"))
    else:
        print("❌ 병합할 결과가 없습니다.")

if __name__ == "__main__":
    parallel_rating_crawl_test()
