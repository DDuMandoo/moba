# 기술스택

- NativeWind, Redux, Axios, Expo Router

# 개발 환경 설정

1. Expo CLI로 새로운 프로젝트 생성
   
   ```git
   npx create-expo-app frontend
   cd frontend
   ```

2. 필수 라이브러리 설치
   
   ```git
   npm install nativewind
   npm install @reduxjs/toolkit react-redux
   npm install axios
   npm install expo-permissions expo-location expo-camera expo-media-library
   npm install expo-notifications
   npm install react-native-config
   npm install react-native-dotenv
   npm install @types/react-native-dotenv --save-dev

   ```

# 디렉토리

```markdown
📦frontend
 ┣ 📂app
 ┃ ┣ 📂(bottom-navigation)
 ┃ ┃ ┣ 📜add.tsx
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┣ 📜index.tsx
 ┃ ┃ ┗ 📜profile.tsx
 ┃ ┣ 📜_layout.tsx
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
 ┃ ┃    ┃ 📜Button.tsx
 ┃ ┃    ┗ 📜RoundedButtonBase.tsx
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
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┣ 📜README.md
 ┃ ┗ 📜tsconfig.json
 ┗ 📜README.md
```
