package com.a601.moba.appointment.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationRedisService {

    private final StringRedisTemplate redisTemplate;

    public void saveLocation(Integer memberId, Double latitude, Double longitude) {
        String key = "user_location:" + memberId;
        String value = latitude + "," + longitude;

        long expireTime = Duration.between(LocalDateTime.now(), LocalDateTime.now().plusMinutes(10)).getSeconds();
        redisTemplate.opsForValue().set(key, value, Duration.ofSeconds(expireTime));
    }

    public String getLocation(Integer memberId) {
        return redisTemplate.opsForValue().get("user_location:" + memberId);
    }
}