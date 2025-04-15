package com.a601.moba.wallet.Entity;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.wallet.Exception.WalletAuthException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "member_id")
    private Member member;

    @Column(nullable = false)
    private Long balance;

    private String password;

    @Builder
    public Wallet(Member member) {
        this.member = member;
        balance = 0L;
    }

    public void updatePassword(String password) {
        this.password = password;
    }

    public void deposit(Long amount) {
        if (amount < 0) {
            throw new WalletAuthException(ErrorCode.INVALID_AMOUNT);
        }
        this.balance += amount;
    }

    public void withdraw(Long amount) {
        if (amount < 0) {
            throw new WalletAuthException(ErrorCode.INVALID_AMOUNT);
        }
        if (this.balance < amount) {
            throw new WalletAuthException(ErrorCode.INSUFFICIENT_BALANCE);
        }
        this.balance -= amount;
    }
}
