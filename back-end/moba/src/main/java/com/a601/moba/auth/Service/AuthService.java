package com.a601.moba.auth.Service;

import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Entity.Member;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Repository.MemberRepository;
import com.a601.moba.email.Service.EmailService;
import com.a601.moba.global.code.ErrorCode;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final StringRedisTemplate redisTemplate;
    private final RedisService redisService;
    private final EmailService emailService;


    @Transactional
    public AuthResponse signin(String email, String password) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
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
        if (storedRefreshToken == null || !refreshToken.equals(storedRefreshToken)) {
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
        String imageUrl = uploadImage(image);

        Member newMember = new Member(email, encodedPassword, name, imageUrl);
        memberRepository.save(newMember);

        return new SignupResponse(newMember.getId(), newMember.getEmail(), newMember.getName(), newMember.getImage());
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

    private String uploadImage(MultipartFile image) {
        // TODO: S3 또는 로컬 서버에 이미지 업로드 로직 추가
        return null;
    }
}
