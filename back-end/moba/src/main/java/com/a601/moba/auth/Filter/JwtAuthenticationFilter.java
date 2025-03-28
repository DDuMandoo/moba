package com.a601.moba.auth.Filter;

import com.a601.moba.auth.Service.AuthRedisService;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final AuthRedisService redisService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
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

                    UserDetails userDetails = User.builder()
                            .username(email)
                            .password("")
                            .roles("MEMBER")
                            .build();

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

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
