def analyze_group_interests(tokens: list):
    from mydata.utils.jwt_utils import verify_access_token
    from mydata.db.recommend_repository import get_latest_recommendation

    
    valid_user_ids = []
    invalid_user_ids = []
    results = []

    for token in tokens:
        try:
            user_id = verify_access_token(token)
            valid_user_ids.append(user_id)

            result = get_latest_recommendation(user_id)
            if result:
                results.append(result)
        except Exception:
            invalid_user_ids.append(user_id)

    # 대분류 설정
    major_categories = ["음식", "카페,디저트", "문화,여가", "술집", "운동"]
    category_sub_score_sum = {cat: {} for cat in major_categories}
    subcategory_count = {cat: {} for cat in major_categories}
    category_to_subcategories = {
        "문화,여가": ['가구', '가구판매', '가방', '가정,생활', '가죽공예', '검도장', '게임방,PC방', '골동품', '공연,연극', '공연장,연극극장', '구두,신발', '그림,벽화', '극단', '글램핑장', '기념품판매', '꽃집,꽃배달', '나이트,클럽', '낚시', '낚시용품', '남성의류,양복', '네일샵', '노래방', '녹음실', '다이어트,비만', '단식원', '단체복,유니폼', '당구장,포켓볼', '대형마트', '대형슈퍼', '도서', '도서관', '도서대여점', '도자기', '독립서점', '만화방', '만화카페', '메이크업', '목공예', '목욕탕,사우나', '무용,댄스', '무용복', '무용학원,발레학원', '문구,사무용품', '문화,예술', '미술,공예', '미술관', '미술학원', '미용', '미용실', '박물관', '반려동물', '반려동물미용', '반려동물분양', '반려동물용품', '반려동물훈련소', '발관리', '방탈출카페', '보드카페', '보석,귀금속', '볼링', '볼링장', '북카페', '사주카페', '사진관,포토스튜디오', '상설할인매장', '생활용품점', '서점', '성인댄스클럽', '속옷,언더웨어', '수목원,식물원', '수예,자수', '수족관', '슈퍼마켓', '스케이트', '스케이트장', '스킨스쿠버', '시계', '실내낚시터', '실용음악학원', '아동복,유아복', '아웃도어용품', '악기대여,악기수리', '악기판매점', '애견카페', '액세서리', '야영,캠핑장', '어린이수영장', '얼음공예', '여가시설', '여성의류', '영상,음향기기제조', '영화,영상', '영화관', '오락실', '워터테마파크', '유아용품', '음반,레코드샵', '음악', '음악감상실', '음악연습실', '음악학원', '음향기기판매점', '의류', '의류소품', '의류판매', '의류할인매장', '이발소', '인라인스케이트용품', '인라인스케이트장', '인터넷서점', '인터넷쇼핑몰', '인테리어', '자전거,싸이클', '자전거대여소', '자전거판매점', '장난감,완구', '전시관', '전통공예', '조각', '중고서점', '중고악기', '중고용품', '취미', '취미용품점', '침구판매', '카메라판매', '커튼,블라인드판매', '코인노래방', '테마파크', '패션잡화점', '피부과', '피부관리', '피아노학원', '행글라이딩,패러글라이딩', '향수', '화랑', '화방', '화장품'],
        "술집": ['술집', '실내포장마차', '오뎅바', '와인바', '유흥주점', '음료,주류제조', '일본식주점', '주류판매', '칵테일바', '호프,요리주점'],
        "운동": ['격투기', '골프', '골프연습장', '골프용품', '농구', '농구장', '무에타이', '무예', '배구', '복싱,권투', '복싱,권투장', '사격,궁도', '수상,수영용품', '수상스포츠', '수영,수상', '수영장', '스크린골프연습장', '스크린야구장', '스크린파크골프연습장', '스키,보드용품', '스키,스노우보드', '스포츠,레저', '스포츠센터', '스포츠시설', '스포츠용품', '스포츠의류', '스포츠클리닉', '야구', '야구연습장', '야구장', '에어로빅', '요가,필라테스', '요가원', '체육관', '체조', '체형관리', '축구', '축구장', '클라이밍', '탁구', '탁구장', '태권도', '테니스', '풋살장', '필라테스', '합기도', '헬스클럽'],
        "음식": ['간식', '갈비', '감자탕', '게,대게', '고기뷔페', '곰탕', '곱창,막창', '구내식당', '국밥', '국수', '굴,전복', '기사식당', '냉면', '닭강정', '닭요리', '도시락', '돈까스,우동', '동남아음식', '두부전문점', '떡볶이', '매운탕,해물탕', '멕시칸,브라질', '밀키트', '바닷가재', '반찬가게', '베트남음식', '복어', '분식', '불고기,두루치기', '뷔페', '사철탕,영양탕', '삼겹살', '삼계탕', '샌드위치', '샐러드', '샤브샤브', '설렁탕', '수산물판매', '수제비', '순대', '스테이크,립', '스페인음식', '식품', '식품서비스업', '식품판매', '쌈밥', '아구', '아시아음식', '야식', '양꼬치', '양식', '오니기리', '오리', '우유판매,유제품판매', '육류,고기', '음식점', '이탈리안', '인도음식', '일본식라면', '일식', '일식집', '장어', '정육점', '조개', '족발,보쌈', '주먹밥', '죽', '중식', '찌개,전골', '참치회', '채식뷔페', '철판요리', '초밥,롤', '추어', '출장요리', '치킨', '칼국수', '태국음식', '토스트', '튀르키예음식', '패밀리레스토랑', '패스트푸드', '편의점', '푸드코트', '퓨전요리', '퓨전일식', '퓨전중식', '퓨전한식', '프랑스음식', '피자', '한식', '한식뷔페', '한정식', '해물,생선', '해산물', '해산물뷔페', '해장국', '햄버거', '회'],
        "카페,디저트": ['갤러리카페', '고양이카페', '다방', '도넛', '디저트카페', '떡,한과', '떡카페', '라이브카페', '무인카페', '생과일전문점', '아이스크림', '아이스크림판매', '전통찻집', '제과,베이커리', '제과기술학원', '제과재료', '차,커피', '초콜릿', '카페', '커피전문점', '키즈카페', '테마카페'],
    }

    # 소분류 -> 대분류 매핑 생성
    sub_to_major = {}
    for major, sub_list in category_to_subcategories.items():
        for sub in sub_list:
            sub_to_major[sub] = major



    for result in results:
        hybrid_scores = result.get("recommendations", [])

        for rec in hybrid_scores:
            sub = rec["소분류"]
            score = rec["score"]
            major = sub_to_major.get(sub)
            if not major:
                continue

            category_sub_score_sum[major][sub] = category_sub_score_sum[major].get(sub, 0) + score
            subcategory_count[major][sub] = subcategory_count[major].get(sub, 0) + 1

    # === 평균 + 정규화 후 top 10 ===
    final_recommend = {}

    for major, sub_scores in category_sub_score_sum.items():
        averaged = []
        for sub, total_score in sub_scores.items():
            count = subcategory_count[major][sub]
            avg = total_score / count if count else 0
            averaged.append({"subcategory": sub, "score_raw": avg})

        if averaged:
            max_score = max(x["score_raw"] for x in averaged)
            for x in averaged:
                x["score"] = round((x["score_raw"] / max_score) * 100, 2) if max_score else 0
                del x["score_raw"]

        averaged.sort(key=lambda x: x["score"], reverse=True)
        final_recommend[major] = averaged[:10]

    print(f"공통 관심사 추천 top 10 (정규화): {final_recommend}")

    return {
        "validUserIds": valid_user_ids,
        "invalidUserIds": invalid_user_ids,
        "recommendedSubcategories": final_recommend
    }
