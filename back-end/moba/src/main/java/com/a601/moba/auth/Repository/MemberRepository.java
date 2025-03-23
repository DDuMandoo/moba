package com.a601.moba.auth.Repository;

import com.a601.moba.auth.Entity.Member;
import jakarta.transaction.Transactional;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);

    boolean existsByEmail(String email);

    @Transactional
    @Modifying
    @Query("UPDATE Member u SET u.password = :password WHERE u.email = :email")
    void updatePasswordByEmail(String email, String password);
}
