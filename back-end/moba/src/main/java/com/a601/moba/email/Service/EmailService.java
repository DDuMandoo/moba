package com.a601.moba.email.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final StringRedisTemplate redisTemplate;
    private final JavaMailSender mailSender;

    private static final String EMAIL_VERIFICATION_PREFIX = "email_verification:";
    private static final long VERIFICATION_CODE_TTL_MINUTES = 5;

    public boolean sendVerificationCode(String email) {
        String code = generateVerificationCode();

        try {
            redisTemplate.opsForValue().set(
                    EMAIL_VERIFICATION_PREFIX + email,
                    code,
                    VERIFICATION_CODE_TTL_MINUTES,
                    TimeUnit.MINUTES
            );
            log.info("[EmailService] 인증 코드 Redis 저장 완료 - email: {}, code: {}", email, code);
        } catch (Exception e) {
            log.error("[EmailService] Redis 저장 실패 - email: {}, error: {}", email, e.getMessage());
            return false;
        }

        try {
            sendEmail(email, code);
            log.info("[EmailService] 이메일 전송 성공 - email: {}", email);
            return true;
        } catch (Exception e) {
            log.error("[EmailService] 이메일 전송 실패 - email: {}, error: {}", email, e.getMessage());
            return false;
        }
    }

    public boolean verifyCode(String email, String code) {
        try {
            String key = EMAIL_VERIFICATION_PREFIX + email;
            String storedCode = redisTemplate.opsForValue().get(key);
            log.info("[EmailService] 인증 코드 조회 - email: {}, storedCode: {}", email, storedCode);

            if (storedCode != null && storedCode.equals(code)) {
                redisTemplate.delete(key);
                return true;
            }
        } catch (Exception e) {
            log.error("[EmailService] 인증 검증 오류 - email: {}, error: {}", email, e.getMessage());
        }
        return false;
    }

    private void sendEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[MoYeoBaRa] 이메일 인증 코드");
        message.setText("인증 코드는 다음과 같습니다:\n\n" + code + "\n\n5분 내에 입력해주세요.");
        mailSender.send(message);
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6자리 숫자
        return String.valueOf(code);
    }
}
