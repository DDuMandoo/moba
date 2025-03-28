package com.a601.moba.member.Entity;

import com.a601.moba.global.entity.BaseTimeEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Getter
@NoArgsConstructor
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Entity
@EntityListeners(AuditingEntityListener.class)
public class Member extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Integer id;

    @Column(name = "EMAIL", nullable = false, unique = true)
    private String email;

    @Column(name = "PASSWORD")
    private String password;

    @Column(name = "NAME", nullable = false)
    private String name;

    @Column(name = "PROFILE_IMAGE")
    private String profileImage;

    @Column(name = "SOCIAL_ID")
    private Long socialId;

    @Column(name = "DELETED_AT")
    private LocalDateTime deletedAt;

    @Column(name = "IS_DELETED", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "MYDATA_TOKEN")
    private String mydataToken;

    public void updateSocialId(Long socialId) {
        this.socialId = socialId;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void changePassword(String newPassword) {
        this.password = newPassword;
    }

    public void updateProfileImage(String imageUrl) {
        this.profileImage = imageUrl;
    }

    public void delete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    public void updateMydataToken(String token) {
        this.mydataToken = token;
    }
}
