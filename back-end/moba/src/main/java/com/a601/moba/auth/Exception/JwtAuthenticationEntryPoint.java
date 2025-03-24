package com.a601.moba.auth.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException)
            throws IOException, ServletException {

        // 404 감지: 존재하지 않는 URL 요청인지 확인
        String requestUri = request.getRequestURI();
        if (!requestUri.startsWith("/api/")) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            JSONResponse<Object> errorResponse = JSONResponse.onFailure(ErrorCode.INVALID_REQUEST);
            response.setContentType("application/json;charset=UTF-8");
            OutputStream out = response.getOutputStream();
            objectMapper.writeValue(out, errorResponse);
            out.flush();
            return;
        }

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        JSONResponse<Object> errorResponse = JSONResponse.onFailure(ErrorCode.UNAUTHORIZED_ACCESS);
        response.setContentType("application/json;charset=UTF-8");
        OutputStream out = response.getOutputStream();
        objectMapper.writeValue(out, errorResponse);
        out.flush();
    }
}
