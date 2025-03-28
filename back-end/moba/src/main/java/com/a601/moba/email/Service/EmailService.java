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
    private static final String VERIFIED_EMAIL_PREFIX = "verified_email:";
    private static final long VERIFICATION_CODE_TTL_MINUTES = 5;
    private static final long VERIFIED_TTL_MINUTES = 10;

    // 인증 코드 전송
    public void sendVerificationCode(String email) {
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
            return;
        }

        try {
            sendEmail(email, code);
            log.info("[EmailService] 이메일 전송 성공 - email: {}", email);
        } catch (Exception e) {
            log.error("[EmailService] 이메일 전송 실패 - email: {}, error: {}", email, e.getMessage());
        }
    }

    // 인증 코드 검증
    public boolean verifyCode(String email, String code) {
        try {
            String key = EMAIL_VERIFICATION_PREFIX + email;
            String storedCode = redisTemplate.opsForValue().get(key);
            log.info("[EmailService] 인증 코드 조회 - email: {}, storedCode: {}", email, storedCode);

            if (storedCode != null && storedCode.equals(code)) {
                redisTemplate.delete(key); // 기존 코드 삭제
                markEmailAsVerified(email); // 인증 완료 표시
                return true;
            }
        } catch (Exception e) {
            log.error("[EmailService] 인증 검증 오류 - email: {}, error: {}", email, e.getMessage());
        }
        return false;
    }

    // 이메일 인증 완료 여부 확인
    public boolean isEmailVerified(String email) {
        String verified = redisTemplate.opsForValue().get(VERIFIED_EMAIL_PREFIX + email);
        log.info("[EmailService] verified 값: {}", verified);
        return "true".equals(verified);
    }

    // 인증 완료 표시 저장(Redis에)
    private void markEmailAsVerified(String email) {
        redisTemplate.opsForValue().set(
                VERIFIED_EMAIL_PREFIX + email,
                "true",
                VERIFIED_TTL_MINUTES,
                TimeUnit.MINUTES
        );
        log.info("[EmailService] 이메일 인증 완료 표시 저장 - email: {}", email);
    }

    // 회원가입 완료 후 인증 표시 삭제
    public void deleteEmailVerified(String email) {
        redisTemplate.delete(VERIFIED_EMAIL_PREFIX + email);
        log.info("[EmailService] 이메일 인증 완료 키 삭제 - email: {}", email);
    }

    // 이메일 발송
    private void sendEmail(String to, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[MoYeoBaRa] 이메일 인증 코드");
        message.setText("인증 코드는 다음과 같습니다.\n\n" + code + "\n\n5분 내에 입력해주세요.");
        mailSender.send(message);
    }

    // 인증 코드 생성
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6자리 숫자
        return String.valueOf(code);
    }

    public void sendTempPasswordEmail(String to, String tempPassword) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("[MoYeoBaRa] 임시 비밀번호 발급 안내");
        message.setText("요청하신 임시 비밀번호는 다음과 같습니다:\n\n" +
                tempPassword + "\n\n" +
                "보안을 위해 30분 내에 비밀번호를 변경해 주세요.");

        mailSender.send(message);
    }
}
