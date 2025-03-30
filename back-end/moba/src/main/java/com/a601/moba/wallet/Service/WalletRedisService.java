package com.a601.moba.wallet.Service;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletRedisService {

    private final StringRedisTemplate redisTemplate;

    public void saveCode(String email, String code) {
        redisTemplate.opsForValue().set("code : " + email, code, Duration.ofMinutes(10));

        log.info("🟢 레디스에 코드 저장");
    }

    public String getCode(String email) {
        return redisTemplate.opsForValue().get("code : " + email);
    }

    public void deleteCode(String email) {
        redisTemplate.delete("code : " + email);
    }
}
