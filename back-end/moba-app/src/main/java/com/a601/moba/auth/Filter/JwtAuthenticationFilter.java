package com.a601.moba.auth.Filter;

import com.a601.moba.auth.Service.AuthRedisService;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import java.util.List;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final AuthRedisService redisService;
    private final MemberRepository memberRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain)
            throws ServletException, IOException {

        String uri = request.getRequestURI();

        // ✅ 인증 필요 없는 경로는 필터 건너뛰기
        if (uri.startsWith("/swagger-ui") ||
                uri.startsWith("/v3/api-docs") ||
                uri.startsWith("/swagger-resources") ||
                uri.startsWith("/webjars") ||
                uri.equals("/swagger-ui.html") ||
                uri.equals("/swagger-ui/index.html") ||

                uri.startsWith("/api/auth/signin") ||
                uri.startsWith("/api/auth/signup") ||
                uri.matches("/api/auth/.+/profile-image") ||   // 와일드카드 대응
                uri.startsWith("/api/auth/email") ||
                uri.startsWith("/api/auth/kakao/callback") ||

                uri.startsWith("/api/emails/send") ||
                uri.startsWith("/api/emails/verify") ||
                uri.startsWith("/api/members/password/reset") ||

                uri.startsWith("/api/ws") ||
                uri.startsWith("/api/chat.send") ||
                uri.startsWith("/api/chat") ||

                request.getMethod().equalsIgnoreCase("OPTIONS")
        ) {
            chain.doFilter(request, response);
            return;
        }

        String token = request.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);

            try {
                // 블랙리스트 확인
                if (redisService.isTokenBlacklisted(token)) {
                    sendJsonErrorResponse(response, ErrorCode.INVALID_TOKEN);
                    return;
                }

                // 유효성 검사 (만료 시 여기서 예외 발생함)
                jwtProvider.isTokenValid(token);

                // 토큰에서 이메일 추출
                String email = jwtProvider.getEmailFromToken(token);

                Member member = memberRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                member,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_MEMBER"))
                        );

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (ExpiredJwtException e) {
                sendJsonErrorResponse(response, ErrorCode.EXPIRED_TOKEN_ERROR);
                return;
            } catch (Exception e) {
                sendJsonErrorResponse(response, ErrorCode.INVALID_TOKEN);
                return;
            }
        }

        // 다음 필터로 넘김
        chain.doFilter(request, response);
    }

    private void sendJsonErrorResponse(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        response.setContentType("application/json");
        response.setStatus(errorCode.getHttpStatus().value());

        JSONResponse<Object> errorResponse = JSONResponse.onFailure(errorCode);
        OutputStream out = response.getOutputStream();
        objectMapper.writeValue(out, errorResponse);
        out.flush();
    }
}
