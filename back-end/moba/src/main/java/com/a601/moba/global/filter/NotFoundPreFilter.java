package com.a601.moba.global.filter;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.servlet.HandlerExecutionChain;
import org.springframework.web.servlet.HandlerMapping;

@RequiredArgsConstructor
public class NotFoundPreFilter implements Filter {

    private final List<HandlerMapping> handlerMappings;
    private final ObjectMapper objectMapper = new ObjectMapper();


    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;

        String uri = req.getRequestURI();
        if (uri.startsWith("/v3/api-docs") ||
                uri.startsWith("/swagger-ui") ||
                uri.startsWith("/swagger-resources") ||
                uri.startsWith("/webjars")) {
            chain.doFilter(request, response);
            return;
        }

        boolean handlerFound = false;

        for (HandlerMapping mapping : handlerMappings) {
            try {
                HandlerExecutionChain handler = mapping.getHandler(req);
                if (handler != null) {
                    handlerFound = true;
                    break;
                }
            } catch (Exception ignored) {
            }
        }

        if (!handlerFound) {
            res.setStatus(HttpServletResponse.SC_NOT_FOUND);
            res.setCharacterEncoding("UTF-8");
            res.setContentType("application/json");
            JSONResponse<Object> responseBody = JSONResponse.onFailure(ErrorCode.INVALID_REQUEST);
            String json = objectMapper.writeValueAsString(responseBody);

            res.getWriter().write(json);
            return;
        }

        chain.doFilter(request, response);
    }
}
