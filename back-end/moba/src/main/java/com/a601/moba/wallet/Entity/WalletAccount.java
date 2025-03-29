package com.a601.moba.wallet.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class WalletAccount {

    @Id
    private String account;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;

    @Column(nullable = false)
    private String bank;

    @Column(nullable = false)
    private boolean isMain;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private String token;

    @Builder
    public WalletAccount(String account,
                         Wallet wallet,
                         String bank,
                         String token) {
        this.account = account;
        this.wallet = wallet;
        this.bank = bank;
        this.token = token;
    }

    public void updateToken(String token) {
        this.token = token;
    }

    public void toggleMain() {
        isMain = !isMain;
    }

}
