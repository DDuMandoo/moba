package com.a601.moba.bank.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
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
public class BankTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "account_id", foreignKey = @ForeignKey(name = "fk_transaction_bank"))
    private BankAccount account;

    @ManyToOne
    @JoinColumn(name = "target_id", foreignKey = @ForeignKey(name = "fk_transaction_target_account"))
    private BankAccount target;

    @Column(nullable = false)
    private LocalDateTime transactionAt;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TransactionType type;

    @Column(length = 13)
    private String name;

    @Builder
    public BankTransaction(BankAccount account,
                           BankAccount target,
                           Long amount,
                           TransactionType type){
        this.account = account;
        this.target = target;
        this.transactionAt = LocalDateTime.now();
        this.amount = amount;
        this.type = type;
    }

    public void updateName(String name){
        this.name = name;
    }

}
