package com.a601.moba.notification.repository;

import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.entity.FcmToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FcmTokenRepository extends JpaRepository<FcmToken, String> {

    // 특정 유저의 토큰 조회
    Optional<FcmToken> findByMember(Member member);

    // 특정 유저의 토큰 존재 여부 확인
    boolean existsByMember(Member member);

    // 특정 유저의 토큰 삭제
    void deleteByMember(Member member);
}
