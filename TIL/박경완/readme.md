# 📌 목차
- [2025.03.05 TIL](#20250305-til)


---

## 2025.03.05 TIL

### Today's Keywords
`JPA` `Transaction` `AOP`

### 오늘 배운 것
1. Spring의 `@Transactional` 동작 방식
- Spring의 AOP를 활용하여 트랜잭션을 관리하며, 프록시 패턴을 사용해 메서드 호출 시 트랜잭션을 적용함
- 트랜잭션이 시작될 때 Connection을 획득하고, 커밋 또는 롤백 시점에 반영됨

2. 트랜잭션의 전파(propagation) 옵션
- `REQUIRED`: 기본값, 기존 트랜잭션이 있으면 참여, 없으면 새로 생성
- `REQUIRES_NEW`: 기존 트랜잭션을 중단하고 새로운 트랜잭션을 생성
- `NESTED`: 기존 트랜잭션 내부에서 중첩된 트랜잭션 생성
트랜잭션 롤백 조건

3. 기본적으로 RuntimeException 또는 Error가 발생하면 롤백
- `@Transactional(rollbackFor = Exception.class)`을 사용하면 Checked Exception도 롤백 가능

4. 프록시 내부 호출 문제
- 같은 클래스 내에서 `@Transactional` 메서드를 호출하면 프록시가 적용되지 않아 트랜잭션이 동작하지 않을 수 있음
- 해결 방법: self-invocation 방지, 별도 서비스로 분리

5. JPA와 트랜잭션
- `EntityManager`는 트랜잭션이 시작될 때 영속성 컨텍스트를 생성하고, 트랜잭션이 커밋될 때 변경 사항을 DB에 반영(Flush)
---
