package com.a601.moba.member.Repository;

import com.a601.moba.member.Entity.Member;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MemberRepository extends JpaRepository<Member, Integer> {
    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);

    Optional<Member> getMemberById(Integer targetId);

    @Query("""
                SELECT m FROM Member m
                WHERE (LOWER(m.name) LIKE %:keyword% OR LOWER(m.email) LIKE %:keyword%)
                AND m.isDeleted = false
                AND (:cursorId IS NULL OR m.id > :cursorId)
                ORDER BY m.id ASC
            """)
    List<Member> searchByKeywordWithCursor(@Param("keyword") String keyword,
                                           @Param("cursorId") Integer cursorId,
                                           Pageable pageable);

    List<Member> findAllByIdIn(List<Integer> friends);
}
