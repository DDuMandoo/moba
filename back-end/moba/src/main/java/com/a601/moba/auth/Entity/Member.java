package com.a601.moba.auth.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
public class Member {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String name;

    @Column(name = "profile_image")
    private String image; // 프로필 이미지 URL

    public Member(String email, String password, String name, String image) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.image = image;
    }

    public void setPassword(String hashedPassword) {
        this.password = hashedPassword;
    }
}
