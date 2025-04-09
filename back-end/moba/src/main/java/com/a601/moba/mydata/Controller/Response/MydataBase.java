package com.a601.moba.mydata.Controller.Response;

import java.util.Map;
import lombok.Builder;

@Builder
public record MydataBase(
        // 추천 소분류 + 점수 (316개)
        Map<String, Double> subcategoryConsumption,
        // 시간대별 소비
        Map<String, Integer> hourlyStats,
        // 페르소나 요약 문장
        String personaSummary,
        // 대분류 별 소분류 → 금액 비율
        Map<String, Map<String, Double>> categoryPriceRatio,
        // 대분류 별 소분류 → 횟수 비율
        Map<String, Map<String, Double>> categoryCountRatio
) {
}
