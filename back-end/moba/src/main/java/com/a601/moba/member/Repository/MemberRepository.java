package com.a601.moba.member.Repository;

import com.a601.moba.member.Entity.Member;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Integer> {
    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);
}
