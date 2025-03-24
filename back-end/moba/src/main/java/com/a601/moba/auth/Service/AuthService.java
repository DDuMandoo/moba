package com.a601.moba.auth.Service;

import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.email.Service.EmailService;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.member.Service.MemberService;
import java.util.Optional;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final RedisService redisService;
    private final EmailService emailService;
    private final MemberService memberService;


    @Transactional
    public AuthResponse signin(String email, String password) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (member.isDeleted()) {
            throw new AuthException(ErrorCode.ALREADY_DELETED_MEMBER);
        }

        // 기존 Refresh Token 삭제 후 새로운 Refresh Token 생성
        redisService.deleteRefreshToken(email);
        String refreshToken = jwtProvider.generateRefreshToken(email);
        long refreshExpirationTime = jwtProvider.getExpirationTime(refreshToken);
        redisService.saveRefreshToken(email, refreshToken, refreshExpirationTime);

        // 새로운 Access Token 생성
        String accessToken = jwtProvider.generateAccessToken(email);

        return new AuthResponse(accessToken, refreshToken);
    }


    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        // Refresh Token 유효성 검증
        if (refreshToken == null || !jwtProvider.isTokenValid(refreshToken)) {
            throw new AuthException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // Refresh Token에서 사용자 이메일 추출
        String email = jwtProvider.getEmailFromToken(refreshToken);

        // Redis에서 저장된 Refresh Token과 비교 (탈취 방지)
        String storedRefreshToken = redisService.getRefreshToken(email);
        if (!refreshToken.equals(storedRefreshToken)) {
            throw new AuthException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // 새로운 Access Token 발급
        String newAccessToken = jwtProvider.generateAccessToken(email);

        return new AuthResponse(newAccessToken, refreshToken);
    }


    @Transactional
    public SignupResponse signup(String email, String password, String name, MultipartFile image) {
        // 이메일 중복 확인
        Optional<Member> existingMember = memberRepository.findByEmail(email);
        if (existingMember.isPresent()) {
            throw new AuthException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (!emailService.isEmailVerified(email)) {
            throw new AuthException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        // 프로필 이미지 처리 (여기서는 기본 URL 사용, S3 업로드 가능)
        String imageUrl = memberService.uploadImage(image);

        Member newMember = new Member(email, encodedPassword, name, imageUrl);
        memberRepository.save(newMember);
        emailService.deleteEmailVerified(email);
        return new SignupResponse(newMember.getId(), newMember.getEmail(), newMember.getName(),
                newMember.getProfileImage());
    }

    @Transactional
    public void signout(String accessToken) {
        // Access Token이 유효한지 확인
        if (accessToken == null || !jwtProvider.isTokenValid(accessToken)) {
            throw new AuthException(ErrorCode.INVALID_TOKEN);
        }

        // Access Token에서 사용자 email 추출
        String email = jwtProvider.getEmailFromToken(accessToken);

        // Refresh Token을 블랙리스트에 추가 후 삭제
        String refreshToken = redisService.getRefreshToken(email);
        if (refreshToken != null) {
            long refreshExpirationTime = jwtProvider.getExpirationTime(refreshToken);
            redisService.addToBlacklist(refreshToken, refreshExpirationTime);
            redisService.deleteRefreshToken(email);
        }

        // Access Token도 블랙리스트에 추가
        long accessExpirationTime = jwtProvider.getExpirationTime(accessToken);
        redisService.addToBlacklist(accessToken, accessExpirationTime);

        // SecurityContext 초기화 (현재 사용자 로그아웃)
        SecurityContextHolder.clearContext();
    }

    @Transactional
    public void resetPassword(String email) {
        // 1. Rate Limit 확인
        String rateLimitKey = "reset_password_rate:" + email;

        Long count = redisTemplate.opsForValue().increment(rateLimitKey);

        if (count != null && count > 5) {
            throw new AuthException(ErrorCode.TOO_MANY_PASSWORD_RESET_REQUESTS);
        }

        // 2. 사용자 조회
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.EMAIL_NOT_FOUND));

        // 3. 임시 비밀번호 생성 및 암호화
        String tempPassword = generateTempPassword();
        String encoded = passwordEncoder.encode(tempPassword);

        // 4. 비밀번호 변경
        member.changePassword(encoded);
        memberRepository.save(member);

        // 5. 이메일 전송
        emailService.sendTempPasswordEmail(email, tempPassword);

        log.info("[AuthService] 임시 비밀번호 발급 완료 - email: {}, tempPassword: {}", email, tempPassword);
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 8 + random.nextInt(5); i++) { // 8~12자리
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

}
