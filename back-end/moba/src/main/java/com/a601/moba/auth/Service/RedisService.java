package com.a601.moba.auth.Service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final StringRedisTemplate redisTemplate;

    // Refresh Token 저장
    public void saveRefreshToken(String email, String refreshToken, long expirationTime) {
        redisTemplate.opsForValue().set(email, refreshToken, expirationTime, TimeUnit.MILLISECONDS);
    }

    // Refresh Token 조회
    public String getRefreshToken(String email) {
        return redisTemplate.opsForValue().get(email);
    }

    // Refresh Token 삭제 (로그아웃 시 사용)
    public void deleteRefreshToken(String email) {
        redisTemplate.delete(email);
    }

    // 블랙리스트(무효화된 Access Token) 저장
    public void addToBlacklist(String token, long expirationTime) {
        redisTemplate.opsForValue().set("blacklist:" + token, "blacklisted", expirationTime, TimeUnit.MILLISECONDS);
    }

    // 블랙리스트 여부 확인
    public boolean isTokenBlacklisted(String token) {
        return redisTemplate.opsForValue().get("blacklist:" + token) != null;
    }

    // 검증된 Access Token을 캐싱하여 성능 최적화
    public void cacheValidAccessToken(String token, long expirationTime) {
        redisTemplate.opsForValue().set("valid_access:" + token, "valid", expirationTime, TimeUnit.MILLISECONDS);
    }

    // 캐싱된 Access Token 검증 결과 확인
    public boolean isAccessTokenCached(String token) {
        return redisTemplate.opsForValue().get("valid_access:" + token) != null;
    }

    // 캐싱된 Access Token 삭제 (로그아웃 시 호출)
    public void deleteCachedAccessToken(String token) {
        redisTemplate.delete("valid_access:" + token);
    }
}
