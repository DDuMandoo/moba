# 📌 목차

- [2025.03.04 TIL](#20250304-til)
- [2025.03.05 TIL](#20250305-til)
- [2025.03.06 TIL](#20250306-til)

---

## 2025.03.04 TIL

### Today's Keywords

`아이디어` `Flutter` `React Native`

### 오늘 배운 것

1. 반려동물 금융 서비스 아이디어 구체화

2. Frontend 프레임워크 회의 -> Flutter로 결정
   
   - Flutter vs React Nataive
     
     | **특징**         | **Flutter**                  | **React Native**                       |
     | -------------- | ---------------------------- | -------------------------------------- |
     | **개발 언어**      | Dart                         | JavaScript                             |
     | **UI 컴포넌트**    | 자체 위젯 사용, 일관된 UI 제공          | 네이티브 컴포넌트 사용, 플랫폼별 UI 제공               |
     | **성능**         | 네이티브 코드로 컴파일, 높은 성능          | JavaScript 브리지 사용, 약간 낮은 성능            |
     | **커뮤니티 및 생태계** | 성장 중, 상대적으로 작은 커뮤니티          | 큰 커뮤니티, 풍부한 서드파티 라이브러리                 |
     | **학습 곡선**      | Dart 언어 학습 필요, 초보자에게 쉬울 수 있음 | JavaScript 개발자에게 친숙, 기존 웹 개발자가 접근하기 쉬움 |
     | **개발 속도**      | Hot Reload 기능으로 빠른 개발 가능     | Hot Reload 지원, 빠른 개발 가능                |

---

## 2025.03.05 TIL

### Today's Keywords

`아이디어` `Dart`

### 오늘 배운 것

1. 시각 장애인 타겟 아이디어 구체화
2. Dart 언어 학습

---

## 2025.03.06 TIL

### Today's Keywords

`아이디어` `Flutter`

### 오늘 배운 것

1. 모임 관리 서비스 아이디어 구체화
2. Flutter 언어 학습

# Flutter 기본 개념 정리

Flutter는 Google에서 개발한 오픈소스 UI 프레임워크로, 하나의 코드베이스로 Android, iOS, 웹, 데스크톱 앱을 개발할 수 있습니다.

## 1. Flutter 개요

- **언어**: Dart 사용
- **특징**:
  - 빠른 UI 렌더링을 위한 **위젯 기반 구조**
  - **Hot Reload**를 통한 빠른 개발 속도
  - **크로스플랫폼 지원** (iOS, Android, 웹, 데스크톱)
  - 높은 성능 (네이티브 성능과 유사)

## 2. Flutter 설치

Flutter를 설치하려면 [Flutter 공식 문서](https://flutter.dev/docs/get-started/install)를 참고하세요.

### 설치 과정 (간단 요약)
1. Flutter SDK 다운로드 및 설치
2. `flutter doctor` 명령어로 환경 확인
3. IDE (VS Code 또는 Android Studio) 설정
4. Android/iOS 시뮬레이터 설정

```sh
flutter doctor
flutter create my_app
cd my_app
flutter run
```

## 3. Flutter 프로젝트 구조

```
my_app/
 ├── android/         # 안드로이드 관련 코드
 ├── ios/            # iOS 관련 코드
 ├── lib/            # 메인 코드 (Dart 파일)
 │   ├── main.dart   # 진입점
 ├── pubspec.yaml    # 패키지 및 설정 파일
 ├── assets/         # 이미지, 폰트 등 리소스
```

- `lib/main.dart`: 애플리케이션의 진입점
- `pubspec.yaml`: 패키지 및 의존성 관리

## 4. Flutter 기본 위젯

Flutter에서는 UI를 구성하는 요소를 **위젯(Widget)**이라고 합니다.

### 주요 위젯
- **기본 위젯**: `Text`, `Container`, `Row`, `Column`, `Stack`, `Image`, `Icon`
- **상태 관리 위젯**: `StatelessWidget`, `StatefulWidget`

```dart
import 'package:flutter/material.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: Scaffold(
        appBar: AppBar(title: Text('Flutter 기본 예제')),
        body: Center(child: Text('Hello, Flutter!')),
      ),
    );
  }
}
```

## 5. StatelessWidget vs StatefulWidget

- **StatelessWidget**: UI가 변하지 않는 정적인 화면에 사용
- **StatefulWidget**: UI가 변경될 가능성이 있는 화면에 사용 (예: 버튼 클릭 시 상태 변경)

```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('나는 Stateless 위젯입니다!');
  }
}
```

```dart
class CounterApp extends StatefulWidget {
  @override
  _CounterAppState createState() => _CounterAppState();
}

class _CounterAppState extends State<CounterApp> {
  int count = 0;

  void increment() {
    setState(() {
      count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Count: \$count'),
        ElevatedButton(onPressed: increment, child: Text('증가')),
      ],
    );
  }
}
```

## 6. 결론

Flutter는 빠른 UI 개발과 크로스플랫폼 지원으로 인해 매우 강력한 프레임워크입니다.
Flutter의 기초 개념을 다루었으며, 더 깊이 있는 학습을 위해 공식 문서와 다양한 튜토리얼을 참고하는 것이 좋습니다.

