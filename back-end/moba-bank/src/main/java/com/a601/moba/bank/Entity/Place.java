package com.a601.moba.bank.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Place {

    @Id
    private Integer id;

    private String keyword;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String subCategory;

    @Column(nullable = false)
    private String roadAddress;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String kakaoUrl;

    @Column(nullable = false)
    private Integer reviewCount;
}