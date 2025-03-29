package com.a601.moba.wallet.Entity;

import com.a601.moba.member.Entity.Member;
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
    private Long amount;

    private String password;

    @Builder
    public Wallet(Member member) {
        this.member = member;
        amount = 0L;
    }

    public void updatePassword(String password) {
        this.password = password;
    }
}
