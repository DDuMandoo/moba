package com.a601.moba.notification.entity;


import com.a601.moba.member.Entity.Member;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
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

@Getter
@Entity
@Builder
@EntityListeners(AuditingEntityListener.class)
@AllArgsConstructor
@NoArgsConstructor
public class FcmToken {

    @Id
    private String token;

    @JoinColumn(name = "id")
    @ManyToOne(fetch = FetchType.LAZY)
    private Member member;

    @CreatedDate
    private LocalDateTime createdAt;
}
