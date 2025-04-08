# 📌 프로젝트 소개 – 모여바라 (Moyobara)

**모여바라**는 약속 잡기부터 비용 정산, 개인 지갑 관리까지 한 번에 해결하는  
**스마트 모임 관리 & 정산 플랫폼**입니다.

> "약속은 가볍게, 정산은 정확하게"

### 🎯 주요 기능

- 📅 **모임 약속 생성 및 장소 추천**

- 🧾 **Dutch Pay 기반 정산 기능**

- 💳 **개인 지갑(잔액, 이체, 내역 관리)**

- 🛂 **이메일 기반 로그인/회원가입 및 JWT 인증**

- 📱 **React Native 기반 하이브리드 앱 + 웹 지원**

### ✅ 핵심 가치

- 사용자의 **약속 참여와 소비 데이터를 기반**으로,

- **더 편리하고, 정확하고, 가벼운 모임 경험**을 제공합니다.

---

## 🛠️ 기술 스택

### 📱 프론트엔드 (React Native + Expo)

- **React Native**: 크로스 플랫폼 앱 개발
- **Expo / EAS Build**: 개발 환경 구성 및 빌드, 배포
- **Expo Router**: 파일 기반 라우팅 시스템
- **Redux Toolkit**: 상태 관리 및 Slice 구조 기반 액션 관리
- **Axios + Interceptor**: API 호출 및 토큰 자동 첨부/재발급 처리
- **SecureStore**: JWT 토큰 안전 저장
- **Custom Components**: `Button`, `RoundedButtonBase`, `CustomAlert`, `WalletStatus` 등 재사용 가능한 UI 구성
- **다크모드 & 테마**: `useColorScheme`, `useThemeColor` 등 커스텀 훅 사용
- **폰트**: `NanumSquareRound` 시리즈 적용 (B/EB/R)

### 🔐 인증 & 보안

- **JWT 기반 인증**: Access / Refresh Token 방식
- **토큰 저장소**: `expo-secure-store`
- **자동 로그인 유지**: Axios Interceptor 내 토큰 갱신 로직 구현
- **회원가입 / 로그인 플로우**: 이메일 인증, 약관 동의 포함 다단계 가입 절차

### 💾 데이터 및 상태 관리

- **Redux Store 구성**: `/redux/store.ts`, `slices/`, `actions/`, `services/`
- **전역 상태 동기화**: 사용자 정보, 토큰, 지갑 상태 등
- **Custom Hook**: 전역 상태 접근 및 디스패치 편의성 제공 (`redux/hooks.ts`)

### 🧪 테스트 및 디버깅

- **구조화된 디버깅 로그**: API 요청 흐름, 응답 구조 기록
- **응답 구조 주의**: `response.data.result` 기반 구조 분해 처리
- **환경 변수 구분**: `Constants.expoConfig.extra.API_URL` 사용으로 앱/웹 호환

### 📂 디렉토리 구조

- **도메인별 분리**: `auth`, `wallet`, `chat`, `promises`, `modal`, `profile` 등
- **공통 요소 분리**: `components/ui`, `utils`, `constants`, `hooks` 등
- **스크립트 자동화**: `scripts/reset-project.js` 등 개발 초기화 지원

---

## 디렉토리

```markdown
📦 frontend
 ┣ 📂app
 ┃ ┣ 📂(bottom-navigation)
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┣ 📜add.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜profile.tsx
 ┃ ┣ 📂auth
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┣ 📜forgot-password.tsx
 ┃ ┃ ┣ 📜login.tsx
 ┃ ┃ ┣ 📜profile-edit.tsx
 ┃ ┃ ┣ 📜signup.tsx
 ┃ ┃ ┗ 📜terms-agreements.tsx
 ┃ ┣ 📂chat
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┗ 📜[appointmentId].tsx
 ┃ ┣ 📂promises
 ┃ ┃ ┣ 📂[id]
 ┃ ┃ ┃ ┣ 📂completed
 ┃ ┃ ┃ ┃ ┗ 📜[dutchpayId].tsx
 ┃ ┃ ┃ ┣ 📜edit.tsx
 ┃ ┃ ┃ ┣ 📜ended.tsx
 ┃ ┃ ┃ ┣ 📜gallery.tsx
 ┃ ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┃ ┗ 📜settlement.tsx
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┗ 📜locationSearch.tsx
 ┃ ┣ 📂wallet
 ┃ ┃ ┣ 📂account
 ┃ ┃ ┃ ┣ 📜accountconnectedcomplete.tsx
 ┃ ┃ ┃ ┗ 📜add.tsx
 ┃ ┃ ┣ 📂settlement
 ┃ ┃ ┃ ┣ 📂send
 ┃ ┃ ┃ ┃ ┗ 📜[id].tsx
 ┃ ┃ ┃ ┣ 📜history.tsx
 ┃ ┃ ┃ ┗ 📜success.tsx
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┣ 📜account.tsx
 ┃ ┃ ┣ 📜charge.tsx
 ┃ ┃ ┣ 📜detail.tsx
 ┃ ┃ ┣ 📜history.tsx
 ┃ ┃ ┣ 📜pin.tsx
 ┃ ┃ ┗ 📜transfer.tsx
 ┃ ┣ 📜_layout.tsx
 ┃ ┣ 📜axiosInstance.ts
 ┃ ┣ 📜index.tsx
 ┃ ┗ 📜LayoutInner.tsx
 ┣ 📂assets
 ┣ 📂components
 ┃ ┣ 📂__tests__
 ┃ ┣ 📂account
 ┃ ┣ 📂charge
 ┃ ┣ 📂layout
 ┃ ┣ 📂modal
 ┃ ┣ 📂pin
 ┃ ┣ 📂profile
 ┃ ┣ 📂promises
 ┃ ┣ 📂settlement
 ┃ ┣ 📂transfer
 ┃ ┣ 📂ui
 ┃ ┣ 📜CustomAlert.tsx
 ┃ ┗ 📜WalletStatus.tsx
 ┣ 📂constants
 ┣ 📂dist
 ┣ 📂hooks
 ┣ 📂redux
 ┣ 📂scripts
 ┣ 📂utils
 ┣ 📜.env
 ┣ 📜.gitignore
 ┣ 📜app.config.json
 ┣ 📜babel.config.js
 ┣ 📜eas.json
 ┣ 📜expo-env.d.ts
 ┣ 📜metro.config.js
 ┣ 📜package-lock.json
 ┣ 📜package.json
 ┣ 📜README.md
 ┣ 📜tailwind.config.js
 ┗ 📜tsconfig.json
```

# 📘 모여바라 프로젝트 문서 정리

---

<details>
<summary>📌 React Native Modal 내 TextInput 포커싱 문제 정리</summary>

React Native에서 `Modal` 컴포넌트 안에 `TextInput`을 사용할 때 다음과 같은 문제가 발생할 수 있습니다.

- 키보드가 올라오지 않음
- 입력이 되지 않음
- `autoFocus`, `.focus()`가 무시됨

**특히 iOS에서 자주 발생하며, 모달이 렌더되기 전에 focus를 줄 경우 문제가 심화됩니다.**

### 🔍 주요 원인

| 원인                 | 설명                                       |
| ------------------ | ---------------------------------------- |
| 렌더 타이밍 문제          | 모달이 완전히 뜨기도 전에 `focus()` 호출 시 포커스 실패     |
| 키보드 동작 문제          | `KeyboardAvoidingView` 미사용 또는 레이아웃 구조 미흡 |
| `autoFocus` 신뢰도 낮음 | 종종 무시되거나 동작하지 않음                         |

### ✅ 해결 방법

```ts
useEffect(() => {
  if (visible) {
    const timer = setTimeout(() => {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }, 300);

    return () => clearTimeout(timer);
  }
}, [visible]);
```

</details>

---

<details>
<summary>🧾 이메일 기반 회원가입 및 로그인 흐름</summary>

# 🧾 모여바라 - 이메일 기반 회원가입 & 로그인 흐름

## 📌 개요

- **이메일/비밀번호 기반 회원가입 및 로그인 기능 구현**
- **JWT 토큰 기반 인증 시스템**
- **SecureStore를 활용한 토큰 안전 저장**
- **Axios Interceptor를 통한 자동 토큰 첨부 및 갱신 처리**

---

## 1️⃣ 회원가입 흐름

### 📍 경로: `/signup.tsx` → `/terms-agreements.tsx`

### 📋 진행 단계

1. 사용자 정보 입력 (이름, 이메일, 비밀번호, 프로필 이미지)
2. 이메일 중복 확인 + 인증번호 발송
3. 이메일 인증 성공
4. 약관 동의 화면으로 이동
5. 약관 동의 후 `/auth/signup` API 호출

```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "1234",
  "name": "홍길동",
  "image": "https://example.com/profile.png"
}
```

### ✅ 응답 시 처리

```json
{
  "isSuccess": true,
  "result": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

- 응답 받은 **accessToken / refreshToken** 은 `SecureStore`에 저장

```ts
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('accessToken', accessToken);
await SecureStore.setItemAsync('refreshToken', refreshToken);
```

- 이후 홈 화면(`/bottom-navigation`)으로 이동

---

## 2️⃣ 로그인 흐름

### 📍 경로: `/index.tsx`

### 📋 진행 단계

1. 이메일/비밀번호 입력
2. `/auth/signin` API 호출

```http
POST /auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "1234"
}
```

### ✅ 응답 시 처리

```json
{
  "isSuccess": true,
  "result": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

- 토큰 저장 후 홈 화면으로 이동

---

## 🔐 토큰 저장 위치

### ✅ `SecureStore`에 저장됨

- 저장 키: `accessToken`, `refreshToken`
- 위치: `utils/authToken.ts`

```ts
export async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync('accessToken', access);
  await SecureStore.setItemAsync('refreshToken', refresh);
}

export async function getAccessToken() {
  return await SecureStore.getItemAsync('accessToken');
}
```

---

## 🔄 토큰 자동 갱신 (Refresh)

### ✅ 설정 위치: `/app/axiosInstance.ts`

#### ✅ Access Token 자동 첨부

```ts
axiosInstance.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

#### ✅ 만료 시 Refresh Token으로 재발급

```http
POST /auth/reissuance
Authorization: {refreshToken}
```

- 응답 받은 새 토큰을 다시 저장
- 기존 요청 재시도

---

## 📦 API 요청 공통 처리

- 모든 API 요청은 `axiosInstance` 를 통해 실행
- headers, baseURL, 토큰 자동처리 일괄 관리

```ts
import axiosInstance from '@/app/axiosInstance';

const res = await axiosInstance.post('/auth/email', { email });
```

---

## ✅ 핵심 요약

| 항목           | 구현 방식                            |
| ------------ | -------------------------------- |
| 회원가입         | `/signup` + `/terms-agreements`  |
| 로그인          | `/auth/signin`                   |
| 토큰 저장 방식     | `expo-secure-store`              |
| access 자동 첨부 | axios interceptor                |
| access 갱신    | `/auth/reissuance` + interceptor |
| 요청 공통 처리     | `axiosInstance.ts`               |

</details>

---

<details>
<summary>🔍 React Native 로그인 디버깅 정리</summary>

# 📱 React Native 로그인 이슈 디버깅 정리

## 🛠️ 개발 환경

- React Native + Expo (with Expo Router)
- EAS Build (development & production)
- 환경변수 관리: `.env`, `eas.json`, `app.config.ts`
- Android emulator (Android Studio 사용)

---

## 1️⃣ 문제 상황

APK를 빌드하여 설치했지만 **로그인 요청이 서버에 도달하지 않음**  
프론트엔드 콘솔에는 `"서버 오류가 발생했습니다"`만 출력됨

---

## 2️⃣ 주요 확인 포인트

### ✅ API 주소 확인

- `API_URL from Constants: https://j12a601.p.ssafy.io/api` → 정상 출력됨
- `.env`에는 `EXPO_PUBLIC_API_URL=https://j12a601.p.ssafy.io/api`
- `app.config.ts`에서 환경변수 등록 시 `extra.API_URL = process.env.EXPO_PUBLIC_API_URL`

### ⚠️ 문제 원인

- `axiosInstance.ts`에서는 `Constants.expoConfig?.extra?.API_URL` 사용 → 정상
- `LoginScreen.tsx`에서는 `process.env.EXPO_PUBLIC_API_URL` 사용 → 웹에서는 됐지만 앱에서는 `undefined` 가능성 있음

---

## 3️⃣ 주요 디버깅 로그

```bash
📤 로그인 요청 전: https://j12a601.p.ssafy.io/api/auth/signin erin456852@gmail.com 1234
🚀 로그인 요청 시작
✅ 로그인 성공 응답: {...}
🧨 axios error: {}
🔚 로그인 요청 종료
```

- 응답은 성공했지만 `axios.post()` 이후 `response.data.result` 접근 오류

- 실제 응답 구조:
  
  ```json
  {
  "code": 2100,
  "isSuccess": true,
  "message": "로그 인에 성공하였습니다",
  "result": {
    "accessToken": "...",
    "refreshToken": "..."
  }
  }
  ```

---

## 4️⃣ 최종 해결 방법

### ✅ 변경 전 (오류 발생)

```ts
const { accesstoken, refreshtoken } = response.data;
```

### ✅ 변경 후 (정상 작동)

```ts
const { accessToken, refreshToken } = response.data.result;
```

---

## 5️⃣ 빌드 시 참고한 설정

### ✅ `eas.json`

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_URL": "https://j12a601.p.ssafy.io/api"
      },
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### ✅ `app.config.ts`

```ts
extra: {
  API_URL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080/api"
}
```

---

## ✨ 교훈

- 서버 응답 구조는 항상 콘솔로 확인하자
- `axios.post()` 이후 구조 분해할 때는 `response.data.result`처럼 계층 구조 주의
- `Constants.expoConfig.extra.API_URL` vs `process.env.EXPO_PUBLIC_API_URL`의 차이 명확히 이해할 것
- 앱과 웹에서 환경 변수의 접근 방식이 다를 수 있으므로 공통화하려면 `Constants` 활용이 안전함

---

✅ 최종 결과: 로그인 성공 및 토큰 저장까지 정상 작동!

</details>

---

<details>
<summary>🛠️ FormData PATCH 프로필 수정 이슈 해결</summary>

# React Native에서 FormData로 PATCH 요청 실패 원인 분석 및 해결

## 📌 문제 요약

React Native 앱에서 사용자 **프로필 수정(PATCH /members/update)**을 시도할 때,
FormData를 사용했지만 `Network Error` 또는 실패 응답이 발생.  
하지만 비슷한 방식의 **약속 생성(POST /appointments)**은 정상 동작함.

---

## 🔍 원인 비교

| 항목              | 약속 생성                                        | 프로필 수정 (실패했던 코드)                           |
| --------------- | -------------------------------------------- | ------------------------------------------ |
| **FormData 구성** | `data`를 파일로 만들어서 JSON으로 추가                   | `data`를 `JSON.stringify()` 후 그대로 append    |
| **헤더**          | `Content-Type`: `multipart/form-data`        | 동일                                         |
| **image**       | 유효한 URI와 타입으로 append                         | 유효하지만, `image` 없이 보낼 땐 `undefined blob` 처리 |
| **라이브러리**       | `axios` + `FileSystem.writeAsStringAsync` 사용 | `axiosInstance`로 바로 전송                     |

---

## ✅ 해결 방법

실패 원인이 되었던 `FormData` 구성 방식을 **약속 생성 방식처럼 변경**:

### 🔧 수정 전 (실패)

```ts
const payload = { name, password };
formData.append('data', JSON.stringify(payload)); // ❌ 문자열 append
```

### ✅ 수정 후 (성공)

```ts
import * as FileSystem from 'expo-file-system';

const payload = { name, password };
const fileUri = FileSystem.documentDirectory + 'data.json';
await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload), {
  encoding: FileSystem.EncodingType.UTF8,
});

formData.append('data', {
  uri: fileUri,
  type: 'application/json',
  name: 'data.json',
} as any);
```

**즉, JSON.stringify로 만든 문자열을 직접 append하는 대신, JSON을 `파일`처럼 만들어서 전송해야** 서버가 정상적으로 multipart/form-data 파싱 가능!

---

## 🧠 왜 이런 차이가 발생했을까?

- 서버는 `multipart/form-data`에서 각 필드를 **파일 파트(file part)** 또는 **텍스트 파트**로 파싱함.
- `data` 필드가 JSON string일 경우, 서버에서 **텍스트로 파싱되어 JSON 파싱 실패**가 발생할 수 있음.
- `application/json` 타입의 **파일 형식**으로 전달하면, 서버에서 이를 파일로 인식 후 JSON 파싱 가능.

---

## 💡 팁

- `PATCH` 요청이라도 `multipart/form-data`에서 JSON 데이터를 보낼 땐 **파일처럼 감싸서 보내자**.
- `expo-file-system` 활용해서 JSON 파일을 만드는 방식은 안정적이다.

---

## ✅ 결론

| 요소      | 실패         | 성공             |
| ------- | ---------- | -------------- |
| JSON 방식 | 문자열 append | 파일 append      |
| 서버 수용   | ❌ 오류 발생    | ✅ 정상 동작        |
| 권장 방식   | X          | ✅ 파일화된 JSON 사용 |

---

## 📁 관련 패키지

- `axios`
- `expo-file-system`
- `expo-image-picker`
- `react-native`

---

</details>
