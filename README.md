# 🧩 Moba - 모여바라
![앱 로고](./moyobara.png)
**모임 관리 · 실시간 정산 추천 모바일 앱**

> **모여바라**는 친구, 동료, 가족과의 약속을 더 스마트하게 관리할 수 있도록 돕는 모바일 플랫폼입니다.  
> 장소 추천부터 모임 정산, 참여자 실시간 위치 공유, 즐길거리까지 **모임의 전 과정을 원스톱**으로 제공합니다.

---

## ✨ 주요 기능

### 1. 약속 생성 · 관리

- **약속 생성**
  
  - 약속명, 참여자, 날짜/시간, 장소, 사진 선택
- **약속 관리**
  
  - 메인 화면 달력에서 약속 조회
    
  - 마이페이지에서 진행/종료 약속 구분 조회
    
  - 상세 페이지에서 기능 제공
    
    - 모임 정보 수정/종료
      
    - 방장 권한 위임
      
    - 실시간 채팅
      
    - 지도 경로·참여자 위치 표시(10분 전부터)
      
    - 관심사 기반 장소 추천
      
    - 갤러리 및 놀거리(룰렛, 핀볼, 주사위 등)
      

### 2. 정산 관리

- **정산 방식**
  
  - 1/N 균등 분할
    
  - 메뉴별 개인별 금액 계산
    
- **내역 조회**
  
  - 내 지갑에서 정산 내역 관리

### 3. 마이데이터 연동 및 내 지갑

- **지갑 기능**
  
  - 충전/송금/거래 내역 확인
- **마이데이터 추천**
  
  - 소비 패턴 분석
    
  - 맞춤형 장소 카테고리 추천
    

### 4. 마이페이지

- 월별 모임 횟수 및 지출 통계
  
- 계좌 연동(1원 인증)
  
- 푸시 알림 (읽음 처리, 삭제)
  

---

## 🛠️ 기술 스택 및 개발 환경

| 영역  | 스택  |
| --- | --- |
| **Frontend** | React Native (Expo), TypeScript, Redux Toolkit, React Navigation |
| **Backend** | Spring Boot 3, Java 17, PostgreSQL, Redis |
| **CI/CD** | Jenkins, Docker, Nginx, AWS EC2/S3/CloudFront |
| **Infra** | AWS Route53, IAM, SSL 인증서 |
| **협업** | Jira, GitHub, Figma, MatterMost, Notion |

---

## 🌱 프로젝트 실행 가이드

### 📂 클론

```bash
git clone https://github.com/DDuMandoo/moba.git
```

### 📲 모바일 앱 실행

1️⃣ 의존성 설치

```bash
cd app
npm install
```

2️⃣ Expo 개발 서버 실행

```bash
npm start
```

> Expo DevTools가 열리며 QR 코드를 스캔해 앱을 실행할 수 있습니다.  
> **iOS:** Expo Go 앱 사용  
> **Android:** Expo Go 앱 사용 또는 에뮬레이터

### ⚙️ 환경 변수

`.env` 파일에 다음 변수 필요:

```
EXPO_PUBLIC_API_URL=https://<your-api-domain>/api
EXPO_PUBLIC_KAKAO_NATIVE_KEY=...
```

### 🧩 EAS 빌드 (앱 배포)

```bash
eas build --platform android
eas build --platform ios
```

> Expo Application Services를 사용해 빌드하고, 앱스토어 배포 가능

---

## 👪 협업 워크플로우

타입 안정성, 상태 관리 효율성, 코드 재사용성, 협업 용이성을 최우선으로 고려했습니다.

### 📝**코드 일관성**

- 표준화된 폴더/파일 구조

### 🔄**Git 협업 전략**

- 기능별 브랜치 관리
- 커밋 메시지 컨벤션

```
feat: // 기능 개발 시
fix: // 수정 시
refactor: // 리팩도링 시
```

---

## 🌟 팀원 소개

| 프로필 | 이름(GitHub) | 역할  |
| --- | --- | --- |
| ![](https://avatars.githubusercontent.com/DDuMandoo) | [@DDuMandoo](https://github.com/DDuMandoo) | 팀장. 백엔드. 실시간 채팅 풀스택 개발 |
| ![](https://avatars.githubusercontent.com/cup-wan) | [@cup-wan](https://github.com/cup-wan) | 백엔드. 마이데이터 생성 및 분석 |
| ![](https://avatars.githubusercontent.com/kjh-0523) | [@kjh-0523](https://github.com/kjh-0523) | 백엔드. 마이데이터 생성 및 분석 |
| ![](https://avatars.githubusercontent.com/seunggeuncho) | [@seunggeuncho](https://github.com/seunggeuncho) | 인프라 구축. 푸시 알림 기능 개발 |
| ![](https://avatars.githubusercontent.com/nikcabe) | [@nikcabe](https://github.com/nikcabe) | 프론트엔드. 정산 관리 페이지 담당 |
| ![](https://avatars.githubusercontent.com/imewuzin) | [@imewuzin](https://github.com/imewuzin) | 프론트엔드. 마이페이지, 약속 생성·관리 페이지, 실시간 위치 표시 담당 |

---

## 📝 회고 및 성장

모여바라는 단순한 약속 앱을 넘어,  
**정산 · 장소 추천 · 실시간 위치 공유**까지 아우르는 통합 솔루션을 모바일에 최적화했습니다.  
React Native + Expo 환경에서 OTA 업데이트, EAS 빌드, 퍼포먼스 최적화를 경험하며  
모바일 서비스 개발 역량을 한층 성장시킨 프로젝트였습니다.