package com.a601.moba.wallet.Repository;

import com.a601.moba.member.Entity.Member;
import com.a601.moba.wallet.Entity.Wallet;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface WalletRepository extends JpaRepository<Wallet, Member> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Wallet> getByMember(Member member);
}
