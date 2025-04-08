import os
import re
import csv
import time
import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import NoSuchElementException
from multiprocessing import Process

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

chromedriver_path = r"C:\Users\SSAFY\Downloads\chromedriver.exe"
output_file = "merged_places.csv"
progress_log = "progress.log"

seoul_gu_list = [
    '마포구', '서대문구', '은평구', '종로구', '중구', '용산구', '성동구', '광진구',
    '동대문구', '성북구', '강북구', '도봉구', '노원구', '중랑구', '강동구', '송파구',
    '강남구', '서초구', '관악구', '동작구', '영등포구', '금천구', '구로구', '양천구', '강서구'
]
search_list = [
    # 음식
    "한식", "양식", "중식", "일식", "고기", "회", "국밥", "설렁탕", "분식", "족발", "보쌈", "치킨", "뷔페", "패스트푸드", "아시아음식",
    
    # 카페/디저트
    "감성카페", "디저트", "루프탑 카페", "브런치 카페", "카공", "케이크", "빵", "아이스크림", "빙수", "베이커리", "프렌차이즈 카페", "전통찻집",

    # 문화/여가
    "전시관", "미술관", "공연장", "문화센터", "서점", "보드카페", "pc방", "공방", "영화관", "노래방", "당구장", "음악",

    # 술집
    "이자카야", "와인바", "칵테일바", "호프", "술집", "안주", "포장마차",

    # 운동
    "헬스장", "필라테스", "요가", "클라이밍", "볼링", "탁구", "수영", "농구", "스쿼시", "축구", "야구", "스포츠"
]

options = webdriver.ChromeOptions()
options.add_argument("lang=ko_KR")
options.add_argument("user-agent=Mozilla/5.0")

def get_lat_lng(place_id):
    url = f"https://place.map.kakao.com/{place_id}"
    headers = {"User-Agent": "Mozilla/5.0"}
    try:
        res = requests.get(url, headers=headers, timeout=3)
        soup = BeautifulSoup(res.text, "html.parser")
        og_image = soup.find("meta", {"property": "og:image"})
        if og_image:
            content = og_image.get("content", "")
            match = re.search(r"m=([0-9.]+)%2C([0-9.]+)", content)
            if match:
                lng, lat = match.group(1), match.group(2)
                return lat, lng
    except:
        pass
    return "", ""

def crawl_keyword_gu(keyword, gu):
    service = Service(executable_path=chromedriver_path)
    driver = webdriver.Chrome(service=service, options=options)
    results = []
    try:
        driver.get("https://map.kakao.com/")
        time.sleep(1)
        search_box = driver.find_element(By.XPATH, '//*[@id="search.keyword.query"]')
        search_box.clear()
        search_box.send_keys(f"{gu} {keyword}")
        driver.find_element(By.XPATH, '//*[@id="search.keyword.submit"]').send_keys(Keys.ENTER)
        time.sleep(1)

        try:
            no_place = driver.find_element(By.ID, "info.noPlace")
            if "HIDDEN" not in no_place.get_attribute("class"):
                return results
        except NoSuchElementException:
            pass

        try:
            more_btn = driver.find_element(By.ID, "info.search.place.more")
            if "HIDDEN" not in more_btn.get_attribute("class"):
                more_btn.send_keys(Keys.ENTER)
                time.sleep(1)
        except NoSuchElementException:
            pass

        page_index = 1

        while True:
            try:
                next_btn = driver.find_element(By.XPATH, f'//*[@id="info.search.page.next"]')
                if "disabled" in next_btn.get_attribute("class") and page_index == 35:
                    break

                if page_index % 5 == 0:
                    driver.find_element(By.XPATH, f'//*[@id="info.search.page.next"]').send_keys(Keys.ENTER)
                    page_index += 1
                    time.sleep(1)
                else:
                    driver.find_element(By.XPATH, f'//*[@id="info.search.page.no{page_index % 5}"]').send_keys(Keys.ENTER)
                    page_index += 1
                    time.sleep(1)
            except NoSuchElementException:
                break

            time.sleep(1)
            place_lists = driver.find_elements(By.CSS_SELECTOR, r'#info\.search\.place\.list > li')
            print(f"\U0001F50D 페이지 {page_index-1} 에서 place_lists 개수: {len(place_lists)}")

            for p in place_lists:
                store_html = p.get_attribute("innerHTML")
                soup = BeautifulSoup(store_html, "html.parser")
                title_tag = soup.select_one('.head_item > .tit_name > .link_name')
                if not title_tag:
                    continue
                name = title_tag.text.strip()
                address = soup.select_one('.info_item > .addr > p').text.strip()
                if gu not in address:
                    continue
                detail_tag = soup.select_one('a.moreview')
                if not detail_tag:
                    continue
                detail_url = detail_tag['href'].strip()
                place_id = detail_url.split("/")[-1]
                lat, lng = get_lat_lng(place_id)
                category_tag = soup.select_one('.subcategory')
                category = category_tag.text.strip() if category_tag else ""
                results.append([keyword, name, category, address, lat, lng, detail_url])

    finally:
        driver.quit()
    return results

def save_results(rows):
    with open(output_file, 'a', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, delimiter='|')
        writer.writerows(rows)

def already_done(keyword, gu):
    if not os.path.exists(progress_log):
        return False
    with open(progress_log, 'r', encoding='utf-8') as f:
        lines = f.read().splitlines()
    return f"{keyword}|{gu}" in lines

def log_progress(keyword, gu):
    with open(progress_log, 'a', encoding='utf-8') as f:
        f.write(f"{keyword}|{gu}\n")

def run_task(keyword, gu):
    if already_done(keyword, gu):
        print(f"✅ 스킵: {keyword} {gu}")
        return
    print(f"🔍 진행 중: {keyword} {gu}")
    start_time = time.time()
    rows = crawl_keyword_gu(keyword, gu)
    elapsed = time.time() - start_time
    save_results(rows)
    log_progress(keyword, gu)
    print(f"✅ 저장 완료: {keyword} {gu} ({len(rows)}건) - ⏱️ 소요 시간: {elapsed:.2f}초")

def parallel_run():
    processes = []
    combos = [(k, g) for k in search_list for g in seoul_gu_list]

    for i in range(0, len(combos), 4):
        chunk = combos[i:i+4]
        processes = []
        for keyword, gu in chunk:
            p = Process(target=run_task, args=(keyword, gu))
            p.start()
            processes.append(p)
        for p in processes:
            p.join()

if __name__ == "__main__":
    if not os.path.exists(output_file):
        with open(output_file, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f, delimiter='|')
            writer.writerow(["키워드", "상호명", "카테고리", "도로명주소", "위도", "경도", "카카오URL"])

    parallel_run()
    print("🎉 전체 크롤링 완료!")