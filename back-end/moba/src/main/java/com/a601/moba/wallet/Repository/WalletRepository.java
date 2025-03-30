package com.a601.moba.wallet.Repository;

import com.a601.moba.member.Entity.Member;
import com.a601.moba.wallet.Entity.Wallet;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<Wallet, Member> {
    Optional<Wallet> getByMember(Member member);

    Optional<Wallet> findByMemberId(Integer memberId);

}
