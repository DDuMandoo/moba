package com.a601.moba.notification.entity;

import com.a601.moba.member.Entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@Getter
public class Notification {

    @Id
    @GeneratedValue
    private Integer id;

    @JoinColumn(name = "receiver", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Member receiver;

    @JoinColumn(name = "sender", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private Member sender;

    @Column(nullable = false)
    private String content;

    @Column(nullable = false, updatable = false)
    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime readAt;

    @Column(nullable = false)
    private Boolean isRead;

    @Column(nullable = true)
    private String deepLink;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Type type;

    public void markAsRead() {
        if (!this.isRead) {
            this.isRead = true;
            this.readAt = LocalDateTime.now();
        }
    }

    public enum Type {
        PAY, INVITE, REMINDER;
    }
}
