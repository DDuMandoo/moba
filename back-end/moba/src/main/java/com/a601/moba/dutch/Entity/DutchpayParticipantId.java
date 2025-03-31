package com.a601.moba.dutch.Entity;

import com.a601.moba.wallet.Entity.Wallet;
import jakarta.persistence.Embeddable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class DutchpayParticipantId implements Serializable {
    @ManyToOne
    @JoinColumn(name = "dutchpay_id")
    private Dutchpay dutchpay;

    @ManyToOne
    @JoinColumn(name = "wallet_id")
    private Wallet wallet;
}
