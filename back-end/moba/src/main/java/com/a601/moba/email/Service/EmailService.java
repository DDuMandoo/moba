package com.a601.moba.email.Service;

import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;
import com.a601.moba.member.Repository.MemberRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
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
    private final MemberRepository memberRepository;

    private static final String EMAIL_SUBJECT = "[MOBA] 이메일 인증 코드 발송";
    private static final String EMAIL_LOGO_URL = "https://moba-image.s3.ap-northeast-2.amazonaws.com/profile/%EB%A1%9C%EA%B7%B8%EC%9D%B8+%EC%9D%B4%EB%AF%B8%EC%A7%80.png\n";
    private static final String EMAIL_HTML_TEMPLATE =
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #d2b48c; border-radius: 12px; background: #f5f0e6; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);'>"
                    + "<div style='text-align: center;'>"
                    + "<img src='%s' alt='MOBA Logo' style='max-width: 120px; height: auto; margin-bottom: 20px;'/>"
                    + "</div>"
                    + "<h2 style='color: #8B5A2B; text-align: center; margin-bottom: 10px;'>모여바라 이메일 인증</h2>"
                    + "<p style='font-size: 16px; color: #5a4634; text-align: center; margin-bottom: 20px;'>"
                    + "안녕하세요! 인증을 위해 아래 코드를 입력해주세요."
                    + "</p>"
                    + "<div style='padding: 15px; background: linear-gradient(135deg, #8B5A2B, #a67c52); text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 2px;'>"
                    + "%s"
                    + "</div>"
                    + "<p style='font-size: 14px; color: #665544; text-align: center; margin-top: 15px;'>"
                    + "코드를 <b style='color: #d2691e;'>5분</b> 내에 입력해주세요."
                    + "</p>"
                    + "<hr style='border: none; border-top: 1px solid #c8a888; margin-top: 20px;'>"
                    + "<p style='font-size: 12px; color: #7d5a4f; text-align: center;'>"
                    + "이 이메일을 요청하지 않았다면 무시하셔도 됩니다."
                    + "</p>"
                    + "</div>";
    private static final String EMAIL_PASSWORD_SUBJECT = "[MOBA] 임시 비밀번호 발급 안내";
    private static final String EMAIL_PASSWORD_TEMPLATE =
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 25px; border: 1px solid #d2b48c; border-radius: 12px; background: #f5f0e6; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);'>"
                    + "<div style='text-align: center;'>"
                    + "<img src='%s' alt='MOBA Logo' style='max-width: 120px; height: auto; margin-bottom: 20px;'/>"
                    + "</div>"
                    + "<h2 style='color: #8B5A2B; text-align: center; margin-bottom: 10px;'>모여바라 임시 비밀번호 발급</h2>"
                    + "<p style='font-size: 16px; color: #5a4634; text-align: center; margin-bottom: 20px;'>"
                    + "안녕하세요! 요청하신 임시 비밀번호는 다음과 같습니다."
                    + "</p>"
                    + "<div style='padding: 15px; background: linear-gradient(135deg, #8B5A2B, #a67c52); text-align: center; border-radius: 8px; font-size: 28px; font-weight: bold; color: #ffffff; letter-spacing: 2px;'>"
                    + "%s"
                    + "</div>"
                    + "<p style='font-size: 14px; color: #665544; text-align: center; margin-top: 15px;'>"
                    + "보안을 위해 <b style='color: #d2691e;'>30분</b> 내에 비밀번호를 변경해 주세요."
                    + "</p>"
                    + "<hr style='border: none; border-top: 1px solid #c8a888; margin-top: 20px;'>"
                    + "<p style='font-size: 12px; color: #7d5a4f; text-align: center;'>"
                    + "이 이메일을 요청하지 않았다면 무시하셔도 됩니다."
                    + "</p>"
                    + "</div>";


    // 인증 코드 전송
    public void sendVerificationCode(String email) {
        if (memberRepository.existsByEmail(email)) {
            throw new CommonException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }
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
            log.error("[EmailService] Redis 저장 실패 - email: {}, error: {}", email, e.getMessage(), e);
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
        String key = VERIFIED_EMAIL_PREFIX + email;
//        String verified = redisTemplate.opsForValue().get(VERIFIED_EMAIL_PREFIX + email);
        String verified = redisTemplate.opsForValue().get("verified_email:" + email);
        log.info("[EmailService] verified 값: {}", verified);
        log.info("Key Value: {}", key);
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
    private void sendEmail(String to, String code) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        String htmlContent = String.format(EMAIL_HTML_TEMPLATE, EMAIL_LOGO_URL, code);

        helper.setTo(to);
        helper.setSubject(EMAIL_SUBJECT);
        helper.setText(htmlContent, true);

        mailSender.send(message);
    }

    // 인증 코드 생성
    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000); // 6자리 숫자
        return String.valueOf(code);
    }

    public void sendTempPasswordEmail(String to, String tempPassword) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String htmlContent = String.format(EMAIL_PASSWORD_TEMPLATE, EMAIL_LOGO_URL, tempPassword);

            helper.setTo(to);
            helper.setSubject(EMAIL_PASSWORD_SUBJECT);
            helper.setText(htmlContent, true); // 🔥 true: HTML 적용

            mailSender.send(message);
        } catch (MessagingException e) {
            // 예외 발생 시 로그 출력
            log.error("이메일 전송 실패: 받는 사람={}", to);
            throw new AuthException(ErrorCode.PASSWORD_RESET_FAILED);
        }
    }
}
