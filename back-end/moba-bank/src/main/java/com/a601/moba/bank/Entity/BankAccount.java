package com.a601.moba.bank.Entity;

import com.a601.moba.bank.Exception.BankException;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class BankAccount extends BaseTimeEntity {

    @Id
    private String id;

    @ManyToOne
    @JoinColumn(name = "bank_id", foreignKey = @ForeignKey(name = "fk_account_bank"))
    private Bank bank;

    @Column(nullable = false)
    private Long balance;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(nullable = false, length = 64)
    private String password;

    @Column(nullable = false)
    private Integer uniqueId;

    @Column(length = 256)
    private String refreshToken;

    private LocalDateTime deletedAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted;

    @Builder
    public BankAccount(String id,
                       Bank bank,
                       Integer uniqueId,
                       String name,
                       String password){
        this.id = id;
        this.bank = bank;
        this.uniqueId = uniqueId;
        this.name = name;
        this.password = password;
        this.balance = 0L;
    }

    public void deposit(Long amount){
        if(amount < 0){
            throw new BankException(ErrorCode.INVALID_AMOUNT);
        }
        this.balance += amount;
    }

    public void withdraw(Long amount){
        if(amount < 0){
            throw new BankException(ErrorCode.INVALID_AMOUNT);
        }
        if(this.balance < amount){
            throw new BankException(ErrorCode.INSUFFICIENT_BALANCE);
        }
        this.balance -= amount;
    }

    public void updateRefreshToken(String refreshToken){
        this.refreshToken = refreshToken;
    }

    public void deleteAccount(){
        isDeleted = true;
        deletedAt = LocalDateTime.now();
    }
}
