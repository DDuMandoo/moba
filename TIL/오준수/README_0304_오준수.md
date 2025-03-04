# JPA의 역할과 필요성

## 1. JPA란?

### **JPA : Java Persistence API**

JPA는 **자바 애플리케이션에서 관계형 데이터베이스(RDB)를 쉽게 다룰 수 있도록 정의된 표준 API**입니다.
- SQL을 직접 작성하지 않고, **객체 지향적인 방식**으로 데이터베이스를 다룰 수 있도록 합니다.
- JDBC의 복잡한 작업을 추상화하여 개발자의 부담을 줄여줍니다.
- JPA는 **"객체와 데이터베이스 간의 매핑을 담당하는 인터페이스"**이며, 이를 구현하는 대표적인 프레임워크가 **Hibernate**입니다.

## 2. JPA의 역할 (5가지)

### ① 객체와 관계형 데이터베이스의 간극 해결 (ORM 역할)

- 자바는 데이터를 **객체(클래스, 필드, 메서드)로 관리**하지만, 데이터베이스는 **테이블, 행, 열**로 데이터를 관리합니다.
- 이를 자동으로 변환하여 매핑해 주는 것이 JPA의 역할입니다.

**JPA 사용 전 (SQL 직접 작성)**
```java
String sql = "SELECT * FROM member WHERE id = ?";
PreparedStatement pstmt = connection.prepareStatement(sql);
pstmt.setLong(1, memberId);
ResultSet rs = pstmt.executeQuery();
if (rs.next()) {
    Member member = new Member(rs.getLong("id"), rs.getString("name"));
}
```

**JPA 사용 후**
```java
Member member = entityManager.find(Member.class, memberId);
```
→ SQL을 직접 다룰 필요 없이 **객체 조작만으로 DB에서 데이터를 조회**할 수 있습니다.

### ② SQL 자동 생성 및 실행

- JPA는 **객체 중심으로 데이터를 다루며, SQL을 자동 생성하여 실행**합니다.
- `find()`, `persist()`, `remove()` 등의 메서드로 SQL을 자동 생성하고 실행합니다.
- 개발자가 직접 SQL을 작성할 필요 없이 **비즈니스 로직에만 집중할 수 있도록 합니다**.

**예시:**
```java
Member member = new Member("John Doe");
entityManager.persist(member);  // INSERT 쿼리 자동 실행
```

### ③ 객체 상태 관리 (영속성 컨텍스트)

JPA는 데이터베이스와 객체를 연결하는 **영속성 컨텍스트**(Persistence Context)를 관리합니다.
- 이를 통해 **변경 감지(Dirty Checking)**, **1차 캐시**, **쓰기 지연(Write-behind)** 등의 기능을 제공합니다.

**Dirty Checking (변경 감지) 예시**
```java
Member member = entityManager.find(Member.class, 1L);
member.setName("New Name");  // 변경 사항 자동 감지
```
→ 트랜잭션이 끝날 때 자동으로 `UPDATE` SQL을 실행합니다.

### ④ 데이터 변경 감지 (Dirty Checking)

- `find()`를 통해 조회한 엔티티는 JPA의 **영속 상태**가 됩니다.
- 변경이 일어나면 **트랜잭션이 끝날 때 자동으로 `UPDATE` SQL 실행**합니다.

```java
// 1. 엔티티 조회 (영속 상태)
Member member = entityManager.find(Member.class, 1L);
// 2. 엔티티 데이터 변경
member.setName("Updated Name");
// 3. 트랜잭션 종료 시점에 자동으로 UPDATE 쿼리 실행
```

### ⑤ DB 독립성 유지 (SQL 종속성 제거)

- **SQL을 직접 작성하는 경우 DB에 종속적인 코드가 많아집니다.**
- JPA는 데이터베이스의 변경(Oracle, MySQL, PostgreSQL 등)에 대한 **유연성을 제공합니다.**

**SQL 직접 사용 (DB 종속적)**
```sql
SELECT * FROM member WHERE name LIKE '%John%';
```

**JPA 사용 (DB 독립적)**
```java
List<Member> members = entityManager
    .createQuery("SELECT m FROM Member m WHERE m.name LIKE :name", Member.class)
    .setParameter("name", "%John%")
    .getResultList();
```
→ 특정 DBMS에 종속되지 않도록 합니다.

## 3. JPA의 핵심 기능 정리

| JPA 기능 | 설명 |
| --- | --- |
| **객체-관계 매핑 (ORM)** | 객체와 테이블을 자동으로 매핑 |
| **SQL 자동 생성** | `persist()`, `merge()`, `remove()` 등으로 SQL 실행 |
| **영속성 컨텍스트** | 엔티티 상태 관리 (1차 캐시, Dirty Checking, Flush) |
| **변경 감지 (Dirty Checking)** | 엔티티 변경 사항을 자동 감지하여 `UPDATE` 실행 |
| **트랜잭션 관리** | 데이터 변경 시 트랜잭션을 자동으로 관리 |
| **DB 독립성 유지** | 특정 DBMS에 종속되지 않도록 SQL 추상화 |

## 4. JPA를 써야 하는 이유

### **JPA의 장점**

- **객체 지향적인 코드 작성 가능** (SQL이 아닌 객체 조작 방식)
- **SQL을 직접 작성할 필요 없음** (자동 SQL 생성)
- **데이터 변경 감지 및 자동 업데이트** (Dirty Checking)
- **DBMS 독립적인 코드 작성 가능** (유지보수성 ↑)
- **트랜잭션 관리가 자동화됨** (안정적인 데이터 처리)

### **JPA의 단점**

- 복잡한 SQL 튜닝이 어려움 (MyBatis보다 SQL 최적화가 어려움)
- 학습 비용이 있음 (JPA, Hibernate의 동작 원리를 이해해야 함)
- 대량 데이터 처리 시 성능 저하 가능
  - **JPQL은 조회된 데이터를 엔티티로 변환해야 하므로 추가적인 오버헤드 발생**
  - **대량 업데이트/삭제 시 비효율성** (네이티브 SQL이 유리할 수 있음)

---

JPA를 통해 객체 지향적인 방식으로 데이터베이스를 다룰 수 있으며, 코드 유지보수성과 개발 생산성을 높일 수 있습니다.
