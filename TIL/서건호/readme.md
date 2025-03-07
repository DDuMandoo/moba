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
아래에서 Dart의 기본 개념을 정리해 보겠습니다.

## 1. 변수 선언하기
Dart에서는 `var`, `final`, `const`, `late` 키워드를 사용하여 변수를 선언할 수 있습니다.

- `var`: 타입을 자동으로 추론합니다.
- 명시적 타입을 사용할 수도 있습니다.
- `late`: 나중에 값을 할당할 변수를 선언할 때 사용합니다.

```dart
var name = "John"; // 타입 추론 (String)
int age = 30; // 명시적 타입 선언
late String address; // 나중에 값을 할당할 변수
2. 변수 타입
Dart의 주요 데이터 타입은 다음과 같습니다:

int - 정수형
double - 실수형
String - 문자열
bool - 불리언 (true 또는 false)
List - 배열 (여러 개의 요소를 저장할 때 사용)
Map - 키-값 쌍으로 이루어진 컬렉션
Set - 중복 없는 데이터 집합
dynamic - 동적 타입 (모든 타입을 가질 수 있음)
int a = 10;
double b = 5.5;
String text = "Hello Dart";
bool isActive = true;
3. Nullable vs Non-nullable
Dart는 Null Safety를 지원하며, 기본적으로 모든 변수는 non-nullable입니다.
즉, 값을 할당하지 않으면 오류가 발생합니다.
Nullable 변수는 ?를 사용하여 선언할 수 있습니다.

String? nullableName; // null이 될 수 있음
String nonNullableName = "John"; // null이 될 수 없음
4. Final vs Const
Dart에서 상수를 선언할 때 final과 const 키워드를 사용합니다.

final: 런타임에 값이 결정되는 상수 (한 번만 할당 가능)
const: 컴파일 타임에 값이 결정되는 상수 (컴파일 시점에 변하지 않는 값)
final currentTime = DateTime.now(); // 런타임 상수
const pi = 3.14; // 컴파일 타임 상수
5. Operators (연산자)
Dart에서 제공하는 주요 연산자는 다음과 같습니다.

산술 연산자: +, -, *, /, %
비교 연산자: ==, !=, >, <, >=, <=
논리 연산자: &&, ||, !
할당 연산자: =, +=, -=, *=, /=
int x = 10;
x += 5; // x = 15
bool isTrue = (x > 5) && (x < 20);
6. List (배열)
List는 여러 개의 값을 저장할 수 있는 자료구조입니다.

List<int> numbers = [1, 2, 3, 4, 5];
numbers.add(6);
numbers.remove(3);
print(numbers); // [1, 2, 4, 5, 6]
7. Map (딕셔너리)
Map은 키와 값으로 이루어진 자료구조입니다.

Map<String, int> scores = {"Alice": 90, "Bob": 85};
scores["Charlie"] = 88;
print(scores["Alice"]); // 90
8. Set (중복 없는 컬렉션)
Set은 중복을 허용하지 않는 데이터 구조입니다.

Set<int> uniqueNumbers = {1, 2, 3, 4, 5};
uniqueNumbers.add(3); // 중복된 값 추가 불가능
print(uniqueNumbers); // {1, 2, 3, 4, 5}
9. if문 (조건문)
if문을 사용하여 조건을 검사하고 특정 코드를 실행할 수 있습니다.

int age = 18;
if (age >= 18) {
  print("성인입니다.");
} else {
  print("미성년자입니다.");
}
10. Loops (반복문)
반복문을 사용하면 코드 실행을 여러 번 반복할 수 있습니다.

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
11. Enum (열거형)
Enum은 여러 개의 상태를 나타낼 때 유용합니다.

enum Status { pending, completed, failed }

void main() {
  Status currentStatus = Status.completed;
  print(currentStatus);
}
12. 함수 (Function)
Dart에서 함수를 선언하는 방법은 다음과 같습니다.

int add(int a, int b) {
  return a + b;
}

void main() {
  print(add(3, 5)); // 8
}
13. Typedef (별칭 타입 정의)
Typedef를 사용하면 특정 함수 타입에 별칭을 지정할 수 있습니다.

typedef MathOperation = int Function(int, int);

int multiply(int a, int b) => a * b;

void main() {
  MathOperation operation = multiply;
  print(operation(4, 5)); // 20
}
  
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

1. 모임 관리 서비스 아이디어 구체화

<details>
<summary>2. Dart 언어 학습</summary>

- 클래스 정의
  
  - `class 클래스명 { ... }` 형태로 선언
  - 클래스 내부에는 변수 (속성) 및 함수 (메서드) 정의
  - 예시:
    - 변수: `name`, `members`
    - 함수: `sayHello()`, `introduce()`

- 인스턴스 생성
  
  - 클래스를 기반으로 실제 객체를 생성하는 과정
  - `클래스명 인스턴스명 = 클래스명();`
  - `new` 키워드는 선택 사항
  - 각 인스턴스는 독립적인 속성 값을 가짐

- 생성자 (Constructor)
  
  - 클래스 이름과 동일한 이름을 가진 메서드
  - 인스턴스 생성 시 초기화 담당
  - 파라미터를 사용하여 속성 값 초기화 가능
    - 위치 기반 파라미터
    - 이름 기반 파라미터 (`{String name, List<String> members}`)

- `this` 키워드
  
  - 클래스 내부에서 현재 인스턴스를 가리킴
  - 속성에 접근할 때 사용 (`this.name`)

- Named Constructor
  
  - 클래스 내에 여러 개의 생성자를 정의하는 방법
  - `클래스명.생성자명()` 형태
  - 예시: `Idol.fromList(List<String> list)`

- `final` 키워드
  
  - 변수를 한 번 초기화하면 변경할 수 없도록 지정
  - 불변성을 유지하는 데 도움

- `const` 키워드
  
  - 컴파일 시점에 값이 결정되는 상수
  - `const` 생성자를 사용하여 불변 인스턴스 생성 가능

- Getter와 Setter
  
  - Getter: 속성 값을 가져오는 메서드 (`get firstName`)
  - Setter: 속성 값을 설정하는 메서드 (`set firstName(String name)`)
  - 속성 값에 접근하고 수정하는 방식을 제어

- Private 변수
  
  - 클래스 외부에서 접근할 수 없는 변수
  - 이름 앞에 `_`를 붙여서 선언 (`String _name`)
  - 캡슐화를 통해 데이터 은닉

- 상속 (Inheritance)
  
  - 기존 클래스의 속성과 메서드를 물려받아 새로운 클래스를 정의하는 기능
  - `extends` 키워드 사용 (`class SubClass extends SuperClass`)
  - 코드 재사용성 및 계층 구조 생성에 유용

- Override
  
  - 상위 클래스의 메서드를 하위 클래스에서 재정의하는 기능
  - `@override` 어노테이션 사용 (선택적)
  - 다형성 구현에 중요

- Static
  
  - 클래스 레벨의 속성 및 메서드를 정의하는 키워드
  - 인스턴스 생성 없이 클래스 이름으로 직접 접근 가능
  - `static` 키워드 사용 (`static int count = 0;`)

- Generic
  
  - 클래스 또는 메서드를 정의할 때 타입 매개변수를 사용하여 다양한 타입에 대해 동작하도록 하는 기능
  - `<T>` 와 같은 타입 매개변수 사용 (`class Data<T> { T value; }`)
  - 타입 안정성 및 코드 재사용성 향상

- Interface
  
  - 클래스가 구현해야 하는 메서드 시그니처를 정의하는 추상 타입
  - `implements` 키워드 사용 (`class MyClass implements MyInterface`)
  - 다형성 및 느슨한 결합(Loose Coupling)을 지원

</details>

---
