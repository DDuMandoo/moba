package com.a601.moba.dutch.Entity;

import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.dutch.Exception.DutchpayException;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.entity.BaseTimeEntity;
import com.a601.moba.member.Entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
public class Dutchpay extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "host_id")
    private Member host;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private Long settlement;

    private LocalDateTime completedAt;

    @Column(nullable = false)
    private boolean isCompleted;

    @Builder
    public Dutchpay(Member host, Appointment appointment, Long price) {
        this.host = host;
        this.appointment = appointment;
        this.price = price;
        this.settlement = 0L;
    }

    public boolean updateSettlement(Long amount) {
        if (amount < 0) {
            throw new DutchpayException(ErrorCode.INVALID_AMOUNT);
        }
        this.settlement += amount;

        if (this.price.equals(this.settlement)) {
            setCompleted();
            return true;
        }
        return false;
    }

    public void setCompleted() {
        if (!this.price.equals(this.settlement)) {
            throw new DutchpayException(ErrorCode.NOT_MATCH_AMOUNT);
        }
        this.completedAt = LocalDateTime.now();
        this.isCompleted = true;
    }

}
