package com.a601.moba.wallet.Repository;

import com.a601.moba.member.Entity.Member;
import com.a601.moba.wallet.Entity.Wallet;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WalletRepository extends JpaRepository<Wallet, Member> {

    @Query("SELECT w FROM Wallet w WHERE w.member = :member")
    Optional<Wallet> getByMember(@Param("member") Member member);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT w FROM Wallet w WHERE w.member = :member")
    Optional<Wallet> getByMemberForUpdate(@Param("member") Member member);

    Optional<Wallet> findByMemberId(Integer memberId);
}
