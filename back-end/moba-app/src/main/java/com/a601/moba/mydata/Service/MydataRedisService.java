package com.a601.moba.mydata.Service;

import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class MydataRedisService {

    private final StringRedisTemplate redisTemplate;

    public void saveCode(String email, String code) {
        redisTemplate.opsForValue().set("smsCode:" + email, code, Duration.ofMinutes(5));
        log.info("🟢 레디스에 코드 저장");
    }

    public String getCode(String email) {
        return redisTemplate.opsForValue().get("smsCode:" + email);
    }

    public void deleteCode(String email) {
        redisTemplate.delete("smsCode:" + email);
    }

    public void setSmsVerificationStatus(Integer userId, String status) {
        redisTemplate.opsForValue().set(
                "smsVerifyStatus:" + userId,
                status,
                Duration.ofMinutes(10)
        );
        log.info("🟢 문자 인증 상태 [{}] 저장 완료", status);
    }

    public String getSmsVerificationStatus(Integer userId) {
        return redisTemplate.opsForValue().get("smsVerifyStatus:" + userId);
    }

    public void clearSmsVerificationStatus(Integer userId) {
        redisTemplate.delete("smsVerifyStatus:" + userId);
        log.info("문자 인증 상태 삭제 완료");
    }
}
