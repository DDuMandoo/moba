package com.a601.moba.auth.Util;

import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthUtil {

    private final JwtProvider jwtProvider;
    private final MemberRepository memberRepository;


    // 현재 요청에서 Access Token 추출
    public String getAccessToken(HttpServletRequest request) {
        String token = request.getHeader("Authorization");
        if (token != null && token.startsWith("Bearer ")) {
            return token.substring(7);
        }
        return null;
    }

    // Access Token을 기반으로 사용자(현재 유저) 객체 불러오기
    public Member getMemberFromToken(HttpServletRequest request) {
        String token = getAccessToken(request);
        if (token == null || !jwtProvider.isTokenValid(token)) {
            throw new AuthException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        String email = jwtProvider.getEmailFromToken(token);

        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.UNAUTHORIZED_ACCESS));
    }

    public Member getCurrentMember() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof Member member) {
            return member;
        }

        throw new AuthException(ErrorCode.UNAUTHORIZED_ACCESS);
    }

}
