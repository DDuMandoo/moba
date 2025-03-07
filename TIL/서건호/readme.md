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
   
   - Flutter vs React Native
     
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
  <summary><strong>2. Dart 언어 학습</strong></summary>

### Dart 언어 기본 정리

Dart는 Google에서 개발한 프로그래밍 언어로, 특히 Flutter 프레임워크에서 많이 사용됩니다.  
Dart의 주요 특징 중 하나는 Null Safety이며, 정적 타입을 지원합니다.

#### 1. 변수 선언하기

```dart
var name = "John"; // 타입 추론 (String)
int age = 30; // 명시적 타입 선언
late String address; // 나중에 값을 할당할 변수
```

#### 2. 변수 타입

```dart
int a = 10;
double b = 5.5;
String text = "Hello Dart";
bool isActive = true;
```

#### 3. Nullable vs Non-nullable

```dart
String? nullableName; // null이 될 수 있음
String nonNullableName = "John"; // null이 될 수 없음
```

#### 4. Final vs Const

```dart
final currentTime = DateTime.now(); // 런타임 상수
const pi = 3.14; // 컴파일 타임 상수
```

#### 5. List (배열)

```dart
List<int> numbers = [1, 2, 3, 4, 5];
numbers.add(6);
numbers.remove(3);
print(numbers); // [1, 2, 4, 5, 6]
```

#### 6. Map (딕셔너리)

```dart
Map<String, int> scores = {"Alice": 90, "Bob": 85};
scores["Charlie"] = 88;
print(scores["Alice"]); // 90
```

#### 7. if문 (조건문)

```dart
int age = 18;
if (age >= 18) {
  print("성인입니다.");
} else {
  print("미성년자입니다.");
}
```

#### 8. 함수 (Function)

```dart
int add(int a, int b) {
  return a + b;
}

void main() {
  print(add(3, 5)); // 8
}
```

#### 9. if문 (조건문)
if문을 사용하여 조건을 검사하고 특정 코드를 실행할 수 있습니다.

```dart
int age = 18;
if (age >= 18) {
  print("성인입니다.");
} else {
  print("미성년자입니다.");
}
```

#### 10. Loops (반복문)
반복문을 사용하면 코드 실행을 여러 번 반복할 수 있습니다.

```dart
For Loop
for (int i = 0; i < 5; i++) {
  print("반복 횟수: \$i");
}
While Loop
int count = 0;
while (count < 3) {
  print("카운트: \$count");
  count++;
}
```

#### 11. Enum (열거형)
Enum은 여러 개의 상태를 나타낼 때 유용합니다.

```dart
enum Status { pending, completed, failed }

void main() {
  Status currentStatus = Status.completed;
  print(currentStatus);
}
```

#### 12. 함수 (Function)
Dart에서 함수를 선언하는 방법은 다음과 같습니다.

```dart
int add(int a, int b) {
  return a + b;
}

void main() {
  print(add(3, 5)); // 8
}
```

#### 13. Typedef (별칭 타입 정의)
Typedef를 사용하면 특정 함수 타입에 별칭을 지정할 수 있습니다.

1. 기본 함수 타입 정의

```dart
typedef MathOperation = int Function(int, int);

int multiply(int a, int b) => a * b;

void main() {
  MathOperation operation = multiply;
  print(operation(4, 5)); // 20
}
```

2. 리스트 타입 별칭 정의

```dart
typedef IntList = List<int>;

void main() {
  IntList numbers = [1, 2, 3, 4, 5];
  print(numbers); // [1, 2, 3, 4, 5]
}
```

3. 함수 타입 정의

```dart
typedef Operation = int Function(int, int);

int add(int a, int b) => a + b;
int subtract(int a, int b) => a - b;

Operation selectedOperation = add;
print(selectedOperation(5, 3)); // Output: 8
```

</details>

---

## 2025.03.06 TIL

### Today's Keywords

`아이디어` `Flutter`

### 오늘 배운 것

1. 모임 관리 서비스 아이디어 구체화

<details>
  <summary><strong>2. Flutter 기본 개념 정리</strong></summary>

### Flutter 개요

Flutter는 Google에서 개발한 오픈소스 UI 프레임워크로, 하나의 코드베이스로 Android, iOS, 웹, 데스크톱 앱을 개발할 수 있습니다.

#### 1. Flutter 개요

- **언어**: Dart 사용
- **특징**:
  - 빠른 UI 렌더링을 위한 위젯 기반 구조
  - Hot Reload를 통한 빠른 개발 속도
  - 크로스플랫폼 지원 (iOS, Android, 웹, 데스크톱)
  - 높은 성능 (네이티브 성능과 유사)

#### 2. Flutter 설치

Flutter를 설치하려면 Flutter 공식 문서를 참고하세요.

##### 설치 과정 (간단 요약)

1. Flutter SDK 다운로드 및 설치
2. `flutter doctor` 명령어로 환경 확인
3. IDE (VS Code 또는 Android Studio) 설정
4. Android/iOS 시뮬레이터 설정

```bash
flutter doctor
flutter create my_app
cd my_app
flutter run
```

#### 3. Flutter 프로젝트 구조

```
my_app/
 ├── android/
 ├── ios/
 ├── lib/
 │   ├── main.dart
 ├── pubspec.yaml
 ├── assets/
```

#### 4. Flutter 기본 위젯

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

5. StatelessWidget vs StatefulWidget

StatelessWidget: UI가 변하지 않는 정적인 화면에 사용

StatefulWidget: UI가 변경될 가능성이 있는 화면에 사용 (예: 버튼 클릭 시 상태 변경)

```dart
class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Text('나는 Stateless 위젯입니다!');
  }
}

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

6. 결론

Flutter는 빠른 UI 개발과 크로스플랫폼 지원으로 인해 매우 강력한 프레임워크입니다.
Flutter의 기초 개념을 다루었으며, 더 깊이 있는 학습을 위해 공식 문서와 다양한 튜토리얼을 참고하는 것이 좋습니다.

</details>

