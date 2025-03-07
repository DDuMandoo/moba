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

<details>
<summary>2. Dart 언어 학습</summary>

# Dart 언어 기본 정리

Dart는 Google에서 개발한 프로그래밍 언어로, 특히 Flutter 프레임워크에서 많이 사용됩니다. 
Dart의 주요 특징 중 하나는 Null Safety이며, 정적 타입을 지원합니다.

## 1. 변수 선언하기
Dart에서는 `var`, `final`, `const`, `late` 키워드를 사용하여 변수를 선언할 수 있습니다.

- `var`: 타입을 자동으로 추론합니다.
- 명시적 타입을 사용할 수도 있습니다.
- `late`: 나중에 값을 할당할 변수를 선언할 때 사용합니다.

```dart
var name = "John"; // 타입 추론 (String)
int age = 30; // 명시적 타입 선언
late String address; // 나중에 값을 할당할 변수
```

## 2. 변수 타입
Dart의 주요 데이터 타입은 다음과 같습니다:

- `int` - 정수형
- `double` - 실수형
- `String` - 문자열
- `bool` - 불리언 (true 또는 false)
- `List` - 배열 (여러 개의 요소를 저장할 때 사용)
- `Map` - 키-값 쌍으로 이루어진 컬렉션
- `Set` - 중복 없는 데이터 집합
- `dynamic` - 동적 타입 (모든 타입을 가질 수 있음)

```dart
int a = 10;
double b = 5.5;
String text = "Hello Dart";
bool isActive = true;
```

## 3. Nullable vs Non-nullable
Dart는 Null Safety를 지원하며, 기본적으로 모든 변수는 non-nullable입니다.
즉, 값을 할당하지 않으면 오류가 발생합니다.
Nullable 변수는 `?`를 사용하여 선언할 수 있습니다.

```dart
String? nullableName; // null이 될 수 있음
String nonNullableName = "John"; // null이 될 수 없음
```

## 4. Final vs Const
Dart에서 상수를 선언할 때 `final`과 `const` 키워드를 사용합니다.

- `final`: 런타임에 값이 결정되는 상수 (한 번만 할당 가능)
- `const`: 컴파일 타임에 값이 결정되는 상수 (컴파일 시점에 변하지 않는 값)

```dart
final currentTime = DateTime.now(); // 런타임 상수
const pi = 3.14; // 컴파일 타임 상수
```

## 5. Operators (연산자)
Dart에서 제공하는 주요 연산자는 다음과 같습니다.

- **산술 연산자**: `+`, `-`, `*`, `/`, `%`
- **비교 연산자**: `==`, `!=`, `>`, `<`, `>=`, `<=`
- **논리 연산자**: `&&`, `||`, `!`
- **할당 연산자**: `=`, `+=`, `-=`, `*=`, `/=`

```dart
int x = 10;
x += 5; // x = 15
bool isTrue = (x > 5) && (x < 20);
```

## 6. List (배열)
```dart
List<int> numbers = [1, 2, 3, 4, 5];
numbers.add(6);
numbers.remove(3);
print(numbers); // [1, 2, 4, 5, 6]
```

## 7. Map (딕셔너리)
```dart
Map<String, int> scores = {"Alice": 90, "Bob": 85};
scores["Charlie"] = 88;
print(scores["Alice"]); // 90
```

## 8. Set (중복 없는 컬렉션)
```dart
Set<int> uniqueNumbers = {1, 2, 3, 4, 5};
uniqueNumbers.add(3); // 중복된 값 추가 불가능
print(uniqueNumbers); // {1, 2, 3, 4, 5}
```

## 9. if문 (조건문)
```dart
int age = 18;
if (age >= 18) {
  print("성인입니다.");
} else {
  print("미성년자입니다.");
}
```

## 10. Loops (반복문)

### For Loop
```dart
for (int i = 0; i < 5; i++) {
  print("반복 횟수: \$i");
}
```

### While Loop
```dart
int count = 0;
while (count < 3) {
  print("카운트: \$count");
  count++;
}
```

## 11. Enum (열거형)
```dart
enum Status { pending, completed, failed }

void main() {
  Status currentStatus = Status.completed;
  print(currentStatus);
}
```

## 12. 함수 (Function)
```dart
int add(int a, int b) {
  return a + b;
}

void main() {
  print(add(3, 5)); // 8
}
```

## 13. Typedef (별칭 타입 정의)
```dart
typedef MathOperation = int Function(int, int);

int multiply(int a, int b) => a * b;

void main() {
  MathOperation operation = multiply;
  print(operation(4, 5)); // 20
}
```


## 2025.03.06 TIL

### Today's Keywords

`아이디어`

### 오늘 배운 것

1. 모임 관리 서비스 아이디어 구체화

<details>
<summary>2. Flutter 언어 학습</summary>

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

### StatelessWidget 예제
```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('나는 Stateless 위젯입니다!');
  }
}
```

### StatefulWidget 예제
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

## 6. 레이아웃 (Row, Column, Stack)

Flutter에서는 **Row, Column, Stack**을 이용하여 UI를 배치합니다.

```dart
Column(
  children: [
    Text('첫 번째 요소'),
    Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        Icon(Icons.star),
        Icon(Icons.favorite),
      ],
    ),
  ],
)
```

## 7. 네비게이션 (페이지 이동)

Flutter에서 화면 간 이동은 `Navigator`를 사용합니다.

```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (context) => SecondPage()),
);
```

뒤로 가기:
```dart
Navigator.pop(context);
```

## 8. HTTP 요청 (API 호출)

Flutter에서 HTTP 요청을 보낼 때 `http` 패키지를 사용합니다.

### `pubspec.yaml`에 `http` 패키지 추가
```yaml
dependencies:
  http: ^0.13.3
```

### HTTP 요청 예제
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

Future<void> fetchData() async {
  final response = await http.get(Uri.parse('https://jsonplaceholder.typicode.com/posts/1'));
  if (response.statusCode == 200) {
    var data = json.decode(response.body);
    print(data);
  }
}
```

## 9. 상태 관리 (State Management)

Flutter에서는 상태 관리를 위해 다양한 방법을 사용할 수 있습니다.

- **setState** (기본적인 방법)
- **Provider** (공식 추천)
- **Riverpod** (Provider 개선 버전)
- **Bloc** (복잡한 상태 관리)

```dart
class CounterProvider with ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void increment() {
    _count++;
    notifyListeners();
  }
}
```

## 10. Flutter의 주요 패키지

| 패키지 이름 | 설명 |
|------------|------|
| `http` | API 요청 |
| `provider` | 상태 관리 |
| `shared_preferences` | 간단한 로컬 저장소 |
| `flutter_bloc` | Bloc 패턴 상태 관리 |
| `url_launcher` | 웹사이트, 전화, 이메일 열기 |

## 11. Flutter 앱 빌드 및 배포

### 앱 실행
```sh
flutter run
```

### 안드로이드 빌드
```sh
flutter build apk
```

### iOS 빌드
```sh
flutter build ios
```

### 웹 빌드
```sh
flutter build web
```

## 12. 결론

Flutter는 빠른 UI 개발과 크로스플랫폼 지원으로 인해 매우 강력한 프레임워크입니다.
Flutter의 기초 개념을 다루었으며, 더 깊이 있는 학습을 위해 공식 문서와 다양한 튜토리얼을 참고하는 것이 좋습니다.


</details>

---
