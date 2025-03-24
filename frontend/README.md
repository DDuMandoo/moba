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
   
   ```



# 디렉토리

```markdown
📦frontend
 ┣ 📂app
 ┃ ┣ 📂(tabs)
 ┃ ┃ ┣ 📜_layout.tsx
 ┃ ┃ ┣ 📜explore.tsx
 ┃ ┃ ┗ 📜index.tsx
 ┃ ┣ 📜_layout.tsx
 ┃ ┗ 📜_not-found.tsx
 ┃ ┣ 📂assets
 ┃ ┃ ┣ 📂fonts
 ┃ ┃ ┗ 📂images
 ┃ ┣ 📂components
 ┃ ┃ ┣ 📂__tests__
 ┃ ┃ ┃ ┣ 📂__snapshots__
 ┃ ┃ ┃ ┃ ┗ 📜ThemedText-test.tsx.snap
 ┃ ┃ ┃ ┗ 📜ThemedText-test.tsx
 ┃ ┃ ┣ 📂ui
 ┃ ┃ ┃ ┣ 📜IconSymbol.ios.tsx
 ┃ ┃ ┃ ┣ 📜IconSymbol.tsx
 ┃ ┃ ┃ ┣ 📜TabBarBackground.ios.tsx
 ┃ ┃ ┃ ┗ 📜TabBarBackground.tsx
 ┃ ┃ ┣ 📜Collapsible.tsx
 ┃ ┃ ┣ 📜ExternalLink.tsx
 ┃ ┃ ┣ 📜HapticTab.tsx
 ┃ ┃ ┣ 📜HelloWave.tsx
 ┃ ┃ ┣ 📜ParallaxScrollView.tsx
 ┃ ┃ ┣ 📜ThemedText.tsx
 ┃ ┃ ┗ 📜ThemedView.tsx
 ┃ ┣ 📂constants
 ┃ ┃ ┗ 📜Colors.ts
 ┃ ┣ 📂hooks
 ┃ ┃ ┣ 📜useColorScheme.ts
 ┃ ┃ ┣ 📜useColorScheme.web.ts
 ┃ ┃ ┗ 📜useThemeColor.ts
 ┃ ┣ 📂scripts
 ┃ ┃ ┗ 📜reset-project.js
 ┃ ┣ 📜.gitignore
 ┃ ┣ 📜app.json
 ┃ ┣ 📜package-lock.json
 ┃ ┣ 📜package.json
 ┃ ┣ 📜README.md
 ┃ ┗ 📜tsconfig.json
 ┗ 📜README.md
```
