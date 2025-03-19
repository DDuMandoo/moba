package com.a601.moba.auth.Util;

import com.a601.moba.auth.Entity.Member;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Repository.MemberRepository;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.global.code.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
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


     // 현재 로그인한 사용자의 이메일 가져오기 (SecurityContext 활용)
    public String getAuthenticatedUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getPrincipal().equals("anonymousUser")) {
            throw new AuthException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        return authentication.getName(); // 이메일 반환
    }

    // 현재 로그인한 사용자의 이메일 가져오기 (Access Token 기반)
    public String getUserEmailFromToken(HttpServletRequest request) {
        String token = getAccessToken(request);
        if (token == null || !jwtProvider.isTokenValid(token)) {
            throw new AuthException(ErrorCode.UNAUTHORIZED_ACCESS);
        }
        return jwtProvider.getEmailFromToken(token);
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
}
