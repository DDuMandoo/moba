package com.a601.moba.appointment.Entity;

import com.a601.moba.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Appointment extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    private String image;

    @Column(nullable = false)
    private LocalDateTime time;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    private Place place;

    @Column
    private String memo;

    @Column(nullable = false, unique = true)
    private String inviteUrl;

    @Column(nullable = false)
    private Boolean isEnded;

    private LocalDateTime deletedAt;

    @Column(nullable = false)
    private boolean reminderSent = false;

    public void update(String name, String image, LocalDateTime time,
                       Place place, String memo) {
        this.name = name;
        this.image = image;
        this.time = time;
        this.place = place;
        this.memo = memo;
    }

    public void uploadImage(String image) {
        this.image = image;
    }

    public void end() {
        this.isEnded = true;
        this.deletedAt = LocalDateTime.now();
    }

    public void markReminderSent() {
        this.reminderSent = true;
    }
}