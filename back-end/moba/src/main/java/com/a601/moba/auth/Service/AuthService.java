package com.a601.moba.auth.Service;

import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Entity.Member;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Repository.MemberRepository;
import com.a601.moba.global.code.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository memberRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse authenticate(String email, String password) {
        Member member = memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.INVALID_CREDENTIALS));

        if (!passwordEncoder.matches(password, member.getPassword())) {
            throw new AuthException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtProvider.generateToken(email);
        return new AuthResponse(token);
    }

    @Transactional
    public SignupResponse registerUser(String email, String password, String name, MultipartFile image) {
        // 이메일 중복 확인
        Optional<Member> existingMember = memberRepository.findByEmail(email);
        if (existingMember.isPresent()) {
            throw new AuthException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        // 프로필 이미지 처리 (여기서는 기본 URL 사용, S3 업로드 가능)
        String imageUrl = (image != null) ? uploadImage(image) : "https://example.com/default-profile.jpg";

        Member newMember = new Member(email, encodedPassword, name, imageUrl);
        memberRepository.save(newMember);

        return new SignupResponse(newMember.getId(), newMember.getEmail(), newMember.getName(), newMember.getImage());
    }

    private String uploadImage(MultipartFile image) {
        // TODO: S3 또는 로컬 서버에 이미지 업로드 로직 추가
        return "https://example.com/uploaded-profile.jpg"; // 임시 URL
    }
}
