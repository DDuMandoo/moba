package com.a601.moba.member.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "PASSWORD", length = 64)
    private String password;

    @Column(name = "NAME", nullable = false, length = 30)
    private String name;

    @Column(name = "PROFILE_IMAGE", length = 255)
    private String profileImage;

    @Column(name = "SOCIAL_ID")
    private Long socialId;

    @CreatedDate
    @Column(name = "CREATED_AT", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "UPDATED_AT", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "DELETED_AT")
    private LocalDateTime deletedAt;

    @Column(name = "IS_DELETED", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "MYDATA_TOKEN", length = 255)
    private String mydataToken;

    public Member(String email, String password, String name, String profileImage) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.profileImage = profileImage;
        this.isDeleted = false;
    }

    public void setPassword(String hashedPassword) {
        this.password = hashedPassword;
    }

    public void setDeleted(boolean deleted) {
        this.isDeleted = deleted;
        this.deletedAt = deleted ? LocalDateTime.now() : null;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updateProfileImage(String imageUrl) {
        this.profileImage = imageUrl;
    }
    
    public void updateMydataToken(String token) {
        this.mydataToken = token;
    }
}
