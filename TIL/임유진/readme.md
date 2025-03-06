# 📌 목차

- [2025.03.04 TIL](#20250304-til)
- [2025.03.05 TIL](#20250305-til)
- [2025.03.06 TIL](#20250306-til)

---

## 2025.03.04 TIL

### Today's Keywords

`아이디어` `Flutter` `React Native`

### 오늘 배운 것

1. 아이디어 회의 및 구체화
   
   - 반려동물 금융 서비스 아이디어 구체화

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

1. 아이디어 회의 및 구체화
   - 시각 장애인 타겟 아이디어 구체화

<details>
<summary>2. Dart 언어 학습</summary>

- 개발 환경 설정
  
  - DartPad 웹사이트를 통해 코딩 가능 (구글 검색)
  
  - 코드 정리: `Format` 버튼 활용
  
  - 콘솔: 출력 결과 확인

- 기본 출력
  
  - `print("Hello World");` 로 콘솔에 텍스트 출력

- 변수 선언 및 타입
  
  - `var` 키워드를 사용하여 변수 선언 (레고 블록과 유사)
  
  - `var name = "코드팩토리";`
  
  - 변수 값 변경 가능: `name = "새로운 값";`
  
  - 변수 타입:
    
    - `int`: 정수
    - `double`: 실수
    - `String`: 문자열
    - `bool`: 참/거짓 (`true`, `false`)
    - `dynamic`: 모든 타입 허용
  
  - 타입 명시적 선언 가능: `String name = "레드벨벳";`

- 연산자
  
  - 정수/실수 연산: `+`, `-`, `/`, `*` 사용 가능
  - 문자열: `+` 연산자로 문자열 연결 가능

- 문자열 템플릿
  
  - `${변수명}` 또는 `${함수 호출}` 형태로 문자열 내에 변수/함수 값 삽입

- 변수 타입
  
  - 정수 (int)
    
    - `int number1 = 10;` (따옴표 없이)
    - 음수도 가능: `int number3 = -20;`
    - 정수 연산: `+`, `-`, `*`, `/` 사용
  
  - 실수 (double)
    
    - `double number1 = 2.5;`
    - `double number2 = 0.5;`
    - 실수 연산: `+`, `-`, `*`, `/` 사용
  
  - Boolean (bool)
    
    - `bool isTrue = true;`
    - `bool isFalse = false;`
  
  - 문자열 (String)
    
    - `String name = "레드벨벳";` (큰따옴표 또는 작은따옴표 사용)
    - 문자열 연결: `+` 연산자 사용
    - 문자열 템플릿: `${변수명}` 사용
  
  - Dynamic
    
    - `dynamic name = "코드팩토리";` (모든 타입 허용)

- Var
  
  - 타입 추론: `var` 는 할당되는 값에 따라 자동으로 타입 결정
    
    - `var name = "블랙핑크";` (String으로 추론)
    - `var number = 20;` (int로 추론)

- Nullable vs Non-nullable
  
  - `String? name`: `name` 변수에 null 값 할당 가능
  - `String name!`: `name` 변수는 절대 null이 아님을 명시

- Final vs Const
  
  - `final` : 변수 선언 후 값 변경 불가
  
  - `const` : 컴파일 시점에 값이 결정되어야 함 (빌드 타임 상수)
  
  - 둘 다 타입 생략 가능

- DateTime 클래스
  
  - `DateTime now = DateTime.now();` 현재 시간 저장
  
  - `final` 과 `const` 차이점:
    
    - `final`: 런타임 시 값을 할당 받을 수 있음
    - `const`: 컴파일 시 값을 알고 있어야 함

- Operators
  
  - `int number = 2;`
  
  - 사칙연산: `+`, `-`, `*`, `/`
  
  - 증감 연산자: `++`, `--`
    
    - 전위: `++number` (먼저 증가 후 사용)
    - 후위: `number++` (먼저 사용 후 증가)
  
  - Null safety 연산자: `??`, `??=`
    
    - `??`: null인 경우에만 값 할당
    - `??=`: 변수가 null인 경우에만 값 할당

- List (배열)
  
  - `List fruits = ['apple', 'banana', 'orange'];`
  - `List numbers =[1];`
  - 인덱스로 접근: `fruits` (결과는 'apple')
  - `add()` 메서드로 요소 추가: `fruits.add('grape');`
  - `length` 속성으로 길이 확인: `fruits.length`

- Map (딕셔너리)
  
  - `Map ages = {'Alice': 30, 'Bob': 25, 'Charlie': 35};`
  - 키로 값 접근: `ages['Alice']` (결과는 30)
  - `containsKey()` 메서드로 키 존재 확인: `ages.containsKey('Alice')` (결과는 true)
  - `putIfAbsent()` 메서드로 키가 없을 때 추가: `ages.putIfAbsent('David', () => 40);`

- Set (집합)
  
  - `Set colors = {'red', 'green', 'blue'};`
  - `add()` 메서드로 요소 추가: `colors.add('yellow');`
  - `contains()` 메서드로 요소 존재 확인: `colors.contains('red')` (결과는 true)

-If 문

```dart
int age = 20;
if (age >= 18) {
  print('Adult');
} else {
  print('Minor');
}
```

- 반복문
  
  - for loop
    
    ```dart
    for (int i = 0; i  fruits = ['apple', 'banana', 'orange'];
    for (String fruit in fruits) {
      print(fruit);
    }
    ```

- Enum (열거형)
  
  ```dart
  enum Color { red, green, blue }
  
  Color selectedColor = Color.red;
  
  switch (selectedColor) {
    case Color.red:
      print('Red');
      break;
    case Color.green:
      print('Green');
      break;
    case Color.blue:
      print('Blue');
      break;
  }
  ```

- 함수
  
  ```dart
  int add(int a, int b) {
    return a + b;
  }
  
  void printMessage(String message) {
    print(message);
  }
  
  int result = add(5, 3);
  printMessage('Result: $result');
  ```
  
  - 화살표 함수 (간단한 함수)
    
    - `int multiply(int a, int b) => a * b;`

- Typedef (타입 정의)
  
  ```dart
  typedef IntList = List;
  
  IntList numbers = [1, 2, 3, 4, 5];
  print(numbers);
  ```
  
  - 함수 타입 정의
    
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

`아이디어`

### 오늘 배운 것
