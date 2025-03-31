기술스택
NativeWind, Redux, Axios, Expo Router
디렉토리
```markdown
📦frontend
 ┣ 📂app
 ┃ ┣ 📂(bottom-navigation)
 ┃ ┃ ┣ 📂wallet
 ┃ ┃ ┃ ┣ 📜detail.tsx
 ┃ ┃ ┃ ┣ 📜history.tsx
 ┃ ┃ ┃ ┣ 📜account.tsx
 ┃ ┃ ┃ ┗ 📜transfer.tsx
 ┃ ┃ ┣ 📜add.tsx
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜profile.tsx
 ┃ ┣ 📜_layout.tsx
 ┃ ┣ 📜index.tsx
 ┃ ┣ 📜forgot-password.tsx
 ┃ ┣ 📜signup.tsx
 ┃ ┣ 📜LayoutInner.tsx
 ┃ ┗ 📜axios.js
 ┃ ┣ 📂assets
 ┃ ┃ ┣ 📂fonts
 ┃ ┃ ┃ ┣ 📜NanumSquareRoundB.ttf
 ┃ ┃ ┃ ┣ 📜NanumSquareRoundEB.ttf
 ┃ ┃ ┃ ┗ 📜NanumSquareRoundR.tts
 ┃ ┃ ┣ 📂icons
 ┃ ┃ ┃ ┗ 📂header
 ┃ ┃ ┃     ┗ 📜Logo.png
 ┃ ┃ ┗ 📂images
 ┃ ┣ 📂components
 ┃ ┃ ┗ 📂ui
 ┃ ┃ ┃  ┃ 📜Button.tsx
 ┃ ┃ ┃  ┗ 📜RoundedButtonBase.tsx
 ┃ ┃ ┗ 📜WalletSatus.tsx
 ┃ ┣ 📂constants
 ┃ ┃ ┣ 📜Colors.ts
 ┃ ┃ ┗ 📜Fonts.ts
 ┃ ┣ 📂hooks
 ┃ ┃ ┣ 📜useColorScheme.ts
 ┃ ┃ ┣ 📜useColorScheme.web.ts
 ┃ ┃ ┗ 📜useThemeColor.ts
 ┃ ┣ 📂scripts
 ┃ ┃ ┗ 📜reset-project.js
 ┃ ┣ 📂redux
 ┃ ┃ ┣ 📂actions
 ┃ ┃ ┣ 📂services
 ┃ ┃ ┣ 📂slices
 ┃ ┃ ┃ ┗ 📜userSlice.ts 
 ┃ ┃ ┣ 📜hooks.ts
 ┃ ┃ ┗ 📜store.ts
 ┃ ┣ 📂scripts
 ┃ ┃ ┗ 📜reset-project.js
 ┃ ┣ 📜.env
 ┃ ┣ 📜.gitignore
 ┃ ┣ 📜app.json
 ┃ ┣ 📜babel.config.js
 ┃ ┣ 📜expo-env.d.ts
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┣ 📜README.md
 ┃ ┗ 📜tsconfig.json
 ┗ 📜README.md
```

<details>
  <summary>React Native Modal 내 TextInput 포커싱 문제 정리</summary>

## 문제 설명
React Native에서 `Modal` 컴포넌트 안에 `TextInput`을 사용할 때, 아래와 같은 현상이 발생할 수 있음:

- 키보드가 올라오지 않음
- 입력이 되지 않음
- `autoFocus`, `.focus()`가 무시됨

특히 **iOS에서 빈번히 발생**하며, 모달이 뜨자마자 포커스를 주려 할 때 문제가 심해짐.

---

## 주요 원인

| 원인 | 설명 |
|------|------|
| **렌더 타이밍 문제** | 모달이 완전히 뜨기도 전에 `focus()` 호출 시 포커스 실패 |
| **키보드 동작 문제** | `KeyboardAvoidingView` 미사용 또는 레이아웃 구조 미흡 |
| **`autoFocus` 신뢰도 낮음** | 종종 무시되거나 동작하지 않음 |

---

## 해결 방법

### 1. `setTimeout + requestAnimationFrame` 조합으로 포커스 타이밍 지연

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
