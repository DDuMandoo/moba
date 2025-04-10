package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.Place;
import com.a601.moba.appointment.Repository.PlaceRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Slf4j
@Service
public class PlaceRecommendationService {

    private final PlaceRepository placeRepository;
    private final RedisTemplate<String, List<Integer>> listRedisTemplate;
    private final StringRedisTemplate stringRedisTemplate;

    @Transactional
    public void processNearbyRecommendations(Appointment appointment) {
        Place basePlace = appointment.getPlace();
        if (basePlace == null) {
            return;
        }

        List<Place> nearbyPlaces = placeRepository.findNearbyPlaces(
                basePlace.getLatitude(), basePlace.getLongitude());

        List<Integer> placeIds = nearbyPlaces.stream()
                .map(Place::getId)
                .toList();

        String baseKey = "appointment:" + appointment.getId();

        // TTL 계산 (지금 ~ 약속 시작 시각까지 초 단위)
        long ttlSeconds = Duration.between(LocalDateTime.now(), appointment.getTime()).getSeconds();
        if (ttlSeconds <= 0) {
            ttlSeconds = 60 * 60; // 만약 약속 시간이 과거라면 기본 1시간 유지
        }

        // Redis 저장
        listRedisTemplate.opsForValue().set(baseKey + ":nearby", placeIds, ttlSeconds, TimeUnit.SECONDS);
        stringRedisTemplate.opsForValue().set(baseKey + ":nearby_status", "DONE", ttlSeconds, TimeUnit.SECONDS);

        log.info("Redis 저장 완료 (key={}, count={}, ttl={}s)", baseKey + ":nearby", placeIds.size(), ttlSeconds);
    }


    public List<Integer> getNearbyPlaces(Integer appointmentId) {
        String key = "appointment:" + appointmentId + ":nearby";
        String json = stringRedisTemplate.opsForValue().get(key);

        if (json == null) {
            return List.of();
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, new TypeReference<List<Integer>>() {
            });
        } catch (Exception e) {
            e.printStackTrace();
            return List.of();
        }
    }

    // 추천 완료 여부 확인용 (선택적 활용)
    public boolean isRecommendationDone(Integer appointmentId) {
        String key = "appointment:" + appointmentId + ":nearby_status";
        return "DONE".equals(stringRedisTemplate.opsForValue().get(key));
    }
}
