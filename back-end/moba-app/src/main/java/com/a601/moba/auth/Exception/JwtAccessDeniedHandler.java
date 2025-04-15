package com.a601.moba.auth.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.OutputStream;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException)
            throws IOException, ServletException {

        response.setContentType("application/json");
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);

        JSONResponse<Object> errorResponse = JSONResponse.onFailure(ErrorCode.FORBIDDEN_ACCESS);
        OutputStream out = response.getOutputStream();
        objectMapper.writeValue(out, errorResponse);
        out.flush();
    }
}
