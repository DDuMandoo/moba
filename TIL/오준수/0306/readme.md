# JPA - Paging & Sorting, JPA 성능 문제 및 개선

## 1. 페이징 및 정렬 (Paging & Sorting)

JPA에서 페이징과 정렬

1. **순수 JPA**를 사용하여 JPQL 혹은 Criteria API로 페이징과 정렬 구현
2. **Spring Data JPA**에서 제공하는 페이징과 정렬 기능 사용

### 1.1 순수 JPA 페이징과 정렬

### 1) 순수 JPA 페이징

순수 JPA에서 페이징은 `Query`의 메서드를 이용하여 설정

- `setFirstResult(int startPosition)`: 조회 시작 위치(0부터 시작)
- `setMaxResults(int maxResult)`: 조회할 데이터 수(한 번에 몇 개를 가져올 것인지)

예시 코드는 다음과 같습니다:

```java
// 예시: Member 엔티티를 기준으로 10~29 번째(20개) 데이터를 DESC 정렬하여 가져오기
String jpql = "SELECT m FROM Member m ORDER BY m.username DESC";
List<Member> members = em.createQuery(jpql, Member.class)
                         .setFirstResult(10)    // 10번 인덱스부터
                         .setMaxResults(20)     // 20개의 데이터만 조회
                         .getResultList();
```

### 2) 순수 JPA 정렬

순수 JPA에서 정렬은 JPQL에서 `ORDER BY` 구문을 통해 간단히 처리할 수 있다.

위 예시에서처럼 `ORDER BY m.username DESC`와 같은 형태로, JPQL에 직접 정렬 조건을 작성해주면 됨 Criteria API를 사용할 때도 Criteria의 `Order` 객체를 통해 지정이 가능

**cf)** 
Criteria API는 **순수 JPA**로 조회 로직을 작성할 때, JPQL 문자열을 직접 작성하는 대신 **자바 코드 형태로(타입 세이프하게)** 쿼리를 동적으로 생성하기 위한 JPA 표준 기능이다.

**Criteria API 예시**:

```java
CriteriaBuilder cb = em.getCriteriaBuilder();
CriteriaQuery<Member> cq = cb.createQuery(Member.class);
Root<Member> member = cq.from(Member.class);

// 정렬 조건 (username DESC)
cq.orderBy(cb.desc(member.get("username")));

// 페이징 처리
TypedQuery<Member> query = em.createQuery(cq)
                             .setFirstResult(10)
                             .setMaxResults(20);

List<Member> members = query.getResultList();

```

### 1.2 Spring Data JPA 페이징과 정렬

Spring Data JPA를 활용하면 페이징과 정렬 처리를 좀 더 편리하게 진행 가능하다. 

Spring Data JPA에서는 **`PagingAndSortingRepository`** 또는 **`JpaRepository`**를 상속받아 페이징 처리 기능을 제공한다.

### 1) 페이징

스프링 데이터 JPA에서 페이징과 정렬을 한번에 관리할 수 있는 객체는 **`PageRequest`**(구현체)이며, **`Pageable`** 인터페이스를 사용한다

```java
// MemberRepository는 JpaRepository 인터페이스를 상속받았다고 가정
public interface MemberRepository extends JpaRepository<Member, Long> {
    // 예: findByUsernameContaining과 같이 쿼리 메서드 위에
    // Spring Data JPA가 자동으로 paging, sorting 기능을 얹혀 제공
}

// 페이징 - 0번째 페이지, 사이즈 10
Pageable pageable = PageRequest.of(0, 10);
Page<Member> pageResult = memberRepository.findAll(pageable);

// Page<Member> 객체를 통해 totalElements, totalPages 등 페이징에 필요한 정보를 조회할 수 있음
long totalElements = pageResult.getTotalElements();
int totalPages = pageResult.getTotalPages();
List<Member> members = pageResult.getContent(); // 실제 데이터
```

### 2) 정렬

정렬 조건은 `PageRequest.of()` 또는 `Sort.by()`를 통해 함께 지정할 수 있습니다.

```java
/ 예: username 기준으로 내림차순 정렬 + 페이징
Pageable pageableWithSort = PageRequest.of(0, 10, Sort.by("username").descending());
Page<Member> sortedPageResult = memberRepository.findAll(pageableWithSort);

List<Member> sortedMembers = sortedPageResult.getContent();
```

- **다중 컬럼 정렬**도 가능: `Sort.by("username").descending().and(Sort.by("age").ascending())`

```java
Pageable pageableMultiSort = PageRequest.of(0, 10,
    Sort.by("username").descending().and(Sort.by("age").ascending())
);
```

---

## 2. JPA 성능 문제 및 개선

JPA의 대표적인 성능 문제 : **N+1 문제**
이를 해결하기 위한 기법으로 자주 사용되는 것이 **`fetch join`** 혹은 **`EntityGraph`** 등을 사용하는 방법입니다.

### 2.1 N+1 문제

### 1) N+1 문제란?

- **N+1 문제**는 **지연 로딩(LAZY Loading)**으로 인해서 발생하는 대표적 성능 문제이다.
- Cf)
지연 로딩(LAZY Loading)은 JPA(또는 ORM)에서 **연관된 엔티티를 실제로 사용(접근)할 때까지 로딩을 지연**시키는 기법이다.
- Ex)
    
    `Member`와 `Team`이 1:N 관계라고 가정.
    Member를 조회하면서 각 Member가 가진 Team 정보를 함께 쓰려고 할 때, 처음 Member를 전체 조회(1번 쿼리)한 뒤, 각 Member에 대해 Team을 다시 조회(N번 쿼리)를 하는 식으로 총 `N+1`번의 쿼리가 발생하는 현상.
    

### 2) 예시

```java
// Member 엔티티의 Team이 LAZY로 설정되어 있다고 가정
List<Member> members = em.createQuery("SELECT m FROM Member m", Member.class)
                         .getResultList();

for (Member member : members) {
    // Team에 접근하는 순간 각각의 member마다 Team 조회 쿼리가 나감
    System.out.println(member.getTeam().getName());
}
```

### 3) 해결 방안

- **Fetch Join** 사용
- **EntityGraph** 사용
- `batch-size`(Hibernate의 `@BatchSize`) 설정

### 2.2 Fetch Join / EntityGraph

### 1) Fetch Join

- **Fetch Join**은 SQL 한 번으로 연관된 엔티티들을 **한 번에** 조회해오기 위한 JPQL 구문이다.
- JPQL에서 `JOIN FETCH`로 설정하면, 지연 로딩이라도 실제 SQL 쿼리 시점에 함께 데이터를 불러옵니다.

예시 코드:

```java
// Member와 Team을 Join 하면서 동시에 Team을 즉시 로딩(페치 조인)해온다.
String jpql = "SELECT m FROM Member m JOIN FETCH m.team";
List<Member> members = em.createQuery(jpql, Member.class)
                         .getResultList();

for (Member member : members) {
    // 이미 Team 정보를 페치 조인을 통해 가져와서 추가 쿼리 발생 X
    System.out.println(member.getTeam().getName());
}
```

실제 실행되는 SQL은 대략 다음과 같이 Member와 Team을 조인해서 한 번에 조회

```sql
SELECT m.*, t.*
FROM Member m
INNER JOIN Team t ON m.team_id = t.id
```

### Fetch Join 주의 사항

- JPA 스펙상 “패치 조인을 둘 이상 사용할 때 결과가 예상치 못한 중복이 발생하거나, 데이터 무결성이 깨질 수 있다.”는 주의가 있다.
    
    → **조인이 여러 번 필요하거나 (복잡한 구조의) 컬렉션에 대한 패치 조인 시에는 더 주의 깊게 설계해야 한다.**
    
- `DISTINCT`를 사용하거나, 엔티티 그래프(EntityGraph) 또는 필요한 시점에만 패치 조인을 적용하는 방식으로 조절한다.

### 2) EntityGraph

- **EntityGraph**는 JPA 2.1에서 도입된 기능으로, JPQL `fetch join`을 대체/보완하기 위해 사용
- 주로 Spring Data JPA에서 **메서드 레벨**로 설정할 수 있어, 코드를 더 깔끔하게 유지할 수 있다.

**예시: Member와 Team간 관계에서 Team을 함께 불러오도록 설정**

```java
@Entity
@NamedEntityGraph(
  name = "Member.withTeam",
  attributeNodes = @NamedAttributeNode("team") // team 필드를 즉시 로딩
)
public class Member {
    @Id @GeneratedValue
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Team team;

    // ... other fields ...
}
```

그리고 Repository에서 사용 시:

```java
public interface MemberRepository extends JpaRepository<Member, Long> {

    // JPQL 없이 NamedEntityGraph를 사용하는 예시
    @EntityGraph(value = "Member.withTeam", type = EntityGraph.EntityGraphType.LOAD)
    @Query("SELECT m FROM Member m")
    List<Member> findAllWithTeam();
}
```

- `@EntityGraph`를 붙여주면, 내부적으로 JPQL에 `JOIN FETCH`를 사용하는 것과 유사한 효과를 낸다.
- 특정 그래프를 원하는 대로 정의하여 필요한 시점에만 쿼리를 최적화해서 날릴 수 있다는 장점이 있다.

### 2.3 배치 사이즈 설정(hibernate.default_batch_fetch_size, @BatchSize)

**Batch Size** 설정은 연관 엔티티를 **지연 로딩(LAZY)** 할 때, **N+1 문제**를 완화하기 위해 한 번에 일정 개수씩 묶어서 데이터를 가져오도록 하는 Hibernate의 확장 기능이다.

### 2.3.1 동작 원리

- 지연 로딩된 엔티티나 컬렉션에 접근할 때, JPA는 보통 **엔티티 하나당 한 번**씩 쿼리를 날리는 문제가 생길 수 있다(N+1).
- **배치 사이즈**를 지정해두면, 예를 들어 **batch-size=10**으로 설정 시, **한 번에 10개 단위**로 묶어서 쿼리를 실행합니다.
    - 즉, 만약 25개의 Member가 지연 로딩된 Team을 필요로 한다면, 10+10+5 → 총 **3번**의 쿼리로 25개 Team을 가져올 수 있다.

### 2.3.2 설정 방법

1. **전역 설정** (application.properties / hibernate.properties 등)
    
    ```
    hibernate.default_batch_fetch_size=100
    ```
    
    - 애플리케이션 전체에 걸쳐 배치 사이즈가 적용된다.
    - 적절한 수(주로 10~100 정도)를 테스트해보고 결정한다.
2. **어노테이션 설정(@BatchSize)**
    - 특정 엔티티나 컬렉션 필드에만 배치 사이즈를 적용할 수 있다.
    - 예:
        
        ```java
        @Entity
        @BatchSize(size = 50)
        public class Member {
            @Id @GeneratedValue
            private Long id;
            @ManyToOne(fetch = FetchType.LAZY)
            private Team team;
            // ...
        }
        ```
        
    - 또는 컬렉션인 경우:
        
        ```java
        @OneToMany(mappedBy = "team", fetch = FetchType.LAZY)
        @BatchSize(size = 50)
        private List<Member> members;
        ```
        
    - 전역 설정과 달리, **필요한 부분에만** 세부적으로 적용할 수 있다는 장점이 있다.

### 2.3.3 주의사항

- **Fetch Join vs Batch Size**
    - Fetch Join은 단 한 번의 쿼리로 연관 엔티티를 전부 끌어올 수 있으나, join으로 인해 **중복 데이터**가 많아질 수 있음.
    - Batch Size는 **N+1 문제**를 줄이면서도, 각 쿼리에 필요한 범위만 가져오기 때문에 대량 데이터 처리 시에는 오히려 유리할 수 있음.
- **완전한 대체 수단**은 아니다
    - 상황에 따라 **EntityGraph**나 **Fetch Join** 등과 적절히 조합하여 사용해야 성능이 최적화됨.
- **적절한 값** 선정
    - 너무 작은 batch-size → 쿼리가 많이 발생
    - 너무 큰 batch-size → 불필요하게 많은 데이터를 끌어와서 DB나 애플리케이션에 부하
    - 실제 트래픽, 데이터 크기를 고려하여 프로파일링을 통해 결정해야 함.

---

## 정리

1. **페이징 & 정렬**
    - **순수 JPA**: `setFirstResult`, `setMaxResults`로 페이징 / JPQL `ORDER BY`로 정렬
    - **Spring Data JPA**: `Pageable`(주로 `PageRequest`)로 페이징 & 정렬 간단 처리
2. **성능 문제 & 최적화**
    - **N+1 문제**: 지연 로딩 시 발생
    - **Fetch Join**: JPQL에 `JOIN FETCH`를 사용하여 한 번에 필요한 데이터 로딩
    - **EntityGraph**: JPA 2.1+ 기능, Spring Data JPA에서 사용 시 편리

실제 프로젝트에서는 **도메인 특성**, **조회 빈도**, **데이터 크기** 등을 고려하여 지연 로딩(LAZY), 즉시 로딩(EAGER) 설정을 적절히 조절하고, 필요할 때 **Fetch Join**이나 **EntityGraph**를 활용해야 합니다.

또한, **배치 사이즈 설정**(`hibernate.default_batch_fetch_size`, `@BatchSize`) 등도 성능 개선에 큰 도움이 될 수 있다.