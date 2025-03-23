//package com.a601.moba.email.Entity;
//
//import jakarta.persistence.Column;
//import jakarta.persistence.Entity;
//import jakarta.persistence.GeneratedValue;
//import jakarta.persistence.GenerationType;
//import jakarta.persistence.Id;
//import java.time.LocalDateTime;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//
//@Entity
//@Getter
//@NoArgsConstructor
//public class EmailVerification {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    @Column(nullable = false, unique = true)
//    private String email;
//
//    @Column(nullable = false)
//    private String code;
//
//    @Column(nullable = false)
//    private LocalDateTime expirationTime;
//
//    public EmailVerification(String email, String code, LocalDateTime expirationTime) {
//        this.email = email;
//        this.code = code;
//        this.expirationTime = expirationTime;
//    }
//}
