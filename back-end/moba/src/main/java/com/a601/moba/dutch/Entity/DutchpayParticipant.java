package com.a601.moba.dutch.Entity;

import com.a601.moba.wallet.Entity.Transaction;
import com.a601.moba.wallet.Entity.TransactionStatus;
import com.a601.moba.wallet.Entity.Wallet;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class DutchpayParticipant {

    @EmbeddedId
    private DutchpayParticipantId id;

    @Column(nullable = false)
    private Long price;

    @OneToOne
    @JoinColumn(name = "deposit_transaction_id")
    private Transaction depositTransaction;

    @OneToOne
    @JoinColumn(name = "withdraw_transaction_id")
    private Transaction withdrawTransaction;

    @Column(nullable = false)
    private boolean status;

    @Builder
    public DutchpayParticipant(Dutchpay dutchpay, Wallet wallet, Long price, Transaction depositTransaction,
                               Transaction withdrawTransaction, boolean status) {
        this.id = new DutchpayParticipantId(dutchpay, wallet);
        this.price = price;
        this.depositTransaction = depositTransaction;
        this.withdrawTransaction = withdrawTransaction;
        this.status = status;
    }

    public void setCompletedTransaction() {
        this.depositTransaction.updateStatus(TransactionStatus.COMPLETED);
        this.withdrawTransaction.updateStatus(TransactionStatus.COMPLETED);
    }

    public void setFailedTransaction() {
        this.depositTransaction.updateStatus(TransactionStatus.FAILED);
        this.withdrawTransaction.updateStatus(TransactionStatus.FAILED);
    }

    public void updateStatus(boolean status) {
        this.status = status;
    }
}
