package com.a601.moba.global.interceptor;

import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

public class AuthHandshakeInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) {

        URI uri = request.getURI();

        // URI에서 쿼리 파라미터 추출
        List<String> tokenParams = UriComponentsBuilder.fromUri(uri).build().getQueryParams().get("token");

        if (tokenParams != null && !tokenParams.isEmpty()) {
            String token = tokenParams.get(0);
            attributes.put("token", token);
        }

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}
