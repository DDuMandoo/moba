package com.a601.moba.auth.Service;

import com.a601.moba.auth.Client.KakaoOAuthClient;
import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.KakaoUserResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.email.Service.EmailService;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;
import com.a601.moba.global.service.S3Service;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.wallet.Service.WalletService;
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
    private final AuthRedisService redisService;
    private final EmailService emailService;
    private final KakaoOAuthClient kakaoOAuthClient;
    private final WalletService walletService;
    private final S3Service s3Service;

    @Transactional
    public AuthResponse signin(String email, String password) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.INVALID_CREDENTIALS));

        if (password == null || !passwordEncoder.matches(password, member.getPassword())) {
            throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (member.isDeleted()) {
            throw new AuthException(ErrorCode.ALREADY_DELETED_MEMBER);
        }

        redisService.deleteRefreshToken(email);

        return issueTokens(email);
    }

    //백에서 바로 카카오 코드를 받을 때 signin
    @Transactional
    public AuthResponse kakaoSignin(String code) {
        String kakaoAccessToken = kakaoOAuthClient.getAccessToken(code);
        KakaoUserResponse kakaoUser = kakaoOAuthClient.getUserInfo(kakaoAccessToken);

        String email = kakaoUser.getKakaoAccount().getEmail();
        String name = kakaoUser.getKakaoAccount().getProfile().getNickname();
        String image = kakaoUser.getKakaoAccount().getProfile().getProfileImageUrl();
        Long socialId = kakaoUser.getId();

        Member member = memberRepository.findByEmail(email).orElse(null);

        // 기존 회원인 경우
        if (member != null) {

            if (member.isDeleted()) {
                throw new AuthException(ErrorCode.ALREADY_DELETED_MEMBER);
            }

            if (member.getPassword() != null) {
                // 일반 로그인 유저이면, 일반 로그인 + socialId 갱신
                if (member.getSocialId() == null) {
                    member.updateSocialId(socialId);
                }
                log.info("[AuthService] 카카오 로그인 → 일반 계정 존재, 소셜 ID 연결 후 로그인");
                return issueTokens(email);
            }

            // 소셜 로그인 유저
            if (!socialId.equals(member.getSocialId())) {
                member.updateSocialId(socialId); // ID가 다르면 갱신(카카오 탈퇴 후 재가입 시 사용)
                log.info("[AuthService] 카카오 로그인 → 소셜 ID 갱신");
            } else {
                log.info("[AuthService] 카카오 로그인 → 기존 소셜 계정 로그인");
            }

            return issueTokens(email);
        }

        // 신규 회원
        Member newMember = Member.builder()
                .email(email)
                .password(null)
                .name(name)
                .profileImage(image)
                .isDeleted(false)
                .build();

        newMember.updateSocialId(socialId);
        memberRepository.save(newMember);

        log.info("[AuthService] 카카오 로그인 → 신규 회원 생성 및 로그인");

        return issueTokens(email);
    }

    //프론트에서 카카오 코드를 받고 POST 요청 보낼 때의 signin
//    @Transactional
//    public AuthResponse kakaoSignin(String code) {
//        String kakaoAccessToken = kakaoOAuthClient.getAccessToken(code);
//        KakaoUserResponse kakaoUser = kakaoOAuthClient.getUserInfo(kakaoAccessToken);
//
//        String email = kakaoUser.getKakaoAccount().getEmail();
//        String name = kakaoUser.getKakaoAccount().getProfile().getNickname();
//        String image = kakaoUser.getKakaoAccount().getProfile().getProfileImageUrl();
//        Long socialId = kakaoUser.getId();
//
//        Member member = memberRepository.findByEmail(email).orElse(null);
//
//        if (member != null) {
//            if (member.isDeleted()) {
//                throw new AuthException(ErrorCode.ALREADY_DELETED_MEMBER);
//            }
//            if (member.getSocialId() == null) {
//                member.updateSocialId(socialId);
//            }
//        } else {
//            member = new Member(email, null, name, image);
//            member.updateSocialId(socialId);
//            memberRepository.save(member);
//        }
//
//        String accessToken = jwtProvider.generateAccessToken(email);
//        String refreshToken = jwtProvider.generateRefreshToken(email);
//        redisService.saveRefreshToken(email, refreshToken, jwtProvider.getExpirationTime(refreshToken));
//
//        return new AuthResponse(accessToken, refreshToken);
//    }


    private AuthResponse issueTokens(String email) {
        String accessToken = jwtProvider.generateAccessToken(email);
        String refreshToken = jwtProvider.generateRefreshToken(email);
        redisService.saveRefreshToken(email, refreshToken, jwtProvider.getExpirationTime(refreshToken));
        return new AuthResponse(accessToken, refreshToken);
    }

    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        if (refreshToken == null) {
            throw new AuthException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        jwtProvider.isTokenValid(refreshToken);

        String email = jwtProvider.getEmailFromToken(refreshToken);
        String storedRefreshToken = redisService.getRefreshToken(email);
        if (!refreshToken.equals(storedRefreshToken)) {
            throw new AuthException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        String newAccessToken = jwtProvider.generateAccessToken(email);
        return new AuthResponse(newAccessToken, refreshToken);
    }

    @Transactional
    public SignupResponse signup(String email, String password, String name) {
        Optional<Member> existingMember = memberRepository.findByEmail(email);

        if (existingMember.isPresent()) {
            Member member = existingMember.get();
            if (!member.isDeleted()) {
                // 삭제되지 않은 계정이면 중복 에러
                throw new AuthException(ErrorCode.EMAIL_ALREADY_EXISTS);
            } else {
                // 삭제된 계정이면 복구
                if (!emailService.isEmailVerified(email)) {
                    throw new AuthException(ErrorCode.EMAIL_NOT_VERIFIED);
                }

                String encodedPassword = passwordEncoder.encode(password);

                member.changePassword(encodedPassword);
                member.updateName(name);
                member.setDeleted(false);
                emailService.deleteEmailVerified(email);

                return SignupResponse.builder()
                        .memberId(member.getId())
                        .email(member.getEmail())
                        .name(member.getName())
                        .build();
            }
        }

        // 신규 회원 가입
        if (!emailService.isEmailVerified(email)) {
            throw new AuthException(ErrorCode.EMAIL_NOT_VERIFIED);
        }

        String encodedPassword = passwordEncoder.encode(password);

        Member newMember = Member.builder()
                .email(email)
                .password(encodedPassword)
                .name(name)
                .isDeleted(false)
                .build();

        memberRepository.save(newMember);
        emailService.deleteEmailVerified(email);
        walletService.create(newMember);

        return SignupResponse.builder()
                .memberId(newMember.getId())
                .email(newMember.getEmail())
                .name(newMember.getName())
                .build();
    }


    @Transactional
    public void uploadProfileImage(Integer memberId, MultipartFile image) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new CommonException(ErrorCode.MEMBER_NOT_FOUND));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = s3Service.uploadFile(image);
        }

        member.updateProfileImage(imageUrl);
    }


    @Transactional
    public void signout(String accessToken) {
        if (accessToken == null) {
            throw new AuthException(ErrorCode.INVALID_TOKEN);
        }

        jwtProvider.isTokenValid(accessToken);

        String email = jwtProvider.getEmailFromToken(accessToken);

        String refreshToken = redisService.getRefreshToken(email);
        if (refreshToken != null) {
            long refreshExpirationTime = jwtProvider.getExpirationTime(refreshToken);
            redisService.addToBlacklist(refreshToken, refreshExpirationTime);
            redisService.deleteRefreshToken(email);
        }

        long accessExpirationTime = jwtProvider.getExpirationTime(accessToken);
        redisService.addToBlacklist(accessToken, accessExpirationTime);

        SecurityContextHolder.clearContext();
    }

    @Transactional
    public void resetPassword(String email) {
        String rateLimitKey = "reset_password_rate:" + email;
        Long count = redisTemplate.opsForValue().increment(rateLimitKey);

        if (count != null && count > 5) {
            throw new AuthException(ErrorCode.TOO_MANY_PASSWORD_RESET_REQUESTS);
        }

        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.EMAIL_NOT_FOUND));

        String tempPassword = generateTempPassword();
        String encoded = passwordEncoder.encode(tempPassword);

        member.changePassword(encoded);
        memberRepository.save(member);

        emailService.sendTempPasswordEmail(email, tempPassword);

        log.info("[AuthService] 임시 비밀번호 발급 완료 - email: {}, tempPassword: {}", email, tempPassword);
    }

    private String generateTempPassword() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < 8 + random.nextInt(5); i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    public boolean isEmailDuplicated(String email) {
        return memberRepository.existsByEmail(email);
    }
}
