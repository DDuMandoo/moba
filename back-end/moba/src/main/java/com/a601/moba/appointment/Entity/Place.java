package com.a601.moba.appointment.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Place {

    @Id
    @Column(name = "company_code")
    private Integer companyCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sigungu", nullable = false)
    private Sigungu sigungu;

    @Column(nullable = false)
    private String category;

    @Column(name = "detail_category", nullable = false)
    private String detailCategory;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private String address;

    @Column(name = "kakao_url")
    private String kakaoUrl; // 선택적: 없다면 제거
}
