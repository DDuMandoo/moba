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

        String token = request.getHeader("Authorization");

        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);

            try {
                if (redisService.isTokenBlacklisted(token)) {
                    sendJsonErrorResponse(response, ErrorCode.INVALID_TOKEN);
                    return;
                }

                if (jwtProvider.isTokenValid(token)) {
                    String email = jwtProvider.getEmailFromToken(token);

                    Member member = memberRepository.findByEmail(email)
                            .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

                    // SecurityContext에 Member 자체를 Principal로 저장
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    member,
                                    null,
                                    List.of(new SimpleGrantedAuthority("ROLE_MEMBER"))
                            );

                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }

            } catch (ExpiredJwtException e) {
                sendJsonErrorResponse(response, ErrorCode.UNAUTHORIZED_ACCESS);
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
