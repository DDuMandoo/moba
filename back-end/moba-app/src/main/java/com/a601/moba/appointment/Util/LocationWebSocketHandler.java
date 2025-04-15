package com.a601.moba.appointment.Util;

import com.a601.moba.appointment.Service.Dto.LocationDto;
import com.a601.moba.appointment.Service.LocationRedisService;
import com.a601.moba.auth.Service.JwtProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Slf4j
@Component
@RequiredArgsConstructor
public class LocationWebSocketHandler extends TextWebSocketHandler {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final LocationRedisService locationRedisService;
    private final JwtProvider jwtProvider;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        Map<String, Object> attributes = session.getAttributes();
        String token = (String) attributes.get("token");

        if (token != null) {
            String email = jwtProvider.getEmailFromToken(token);
            sessions.put(email, session);
            log.info("WebSocket 연결됨: 사용자 ID {} -> 세션 ID {}", email, session.getId());
        } else {
            log.warn("WebSocket 연결됨: 토큰 없음 (세션 ID: {})", session.getId());
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) {
        try {
            LocationDto locationData = objectMapper.readValue(message.getPayload(), LocationDto.class);
            log.info("🟢 위치 수신: {}", locationData);

            locationRedisService.saveLocation(
                    locationData.memberId(),
                    locationData.latitude(),
                    locationData.longitude()
            );
        } catch (IOException e) {
            log.error(" JSON 파싱 오류: {}", message.getPayload());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String disconnectedEmail = null;

        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            if (entry.getValue().equals(session)) {
                disconnectedEmail = entry.getKey();
                break;
            }
        }

        if (disconnectedEmail != null) {
            sessions.remove(disconnectedEmail);
            log.info("WebSocket 연결 종료됨: 사용자 ID {} -> 세션 ID {}", disconnectedEmail, session.getId());
        } else {
            log.warn("세션을 찾을 수 없음 (세션 ID: {})", session.getId());
        }
    }

    // 🔹 WebSocket 세션을 가져오는 메서드 추가
    public WebSocketSession getSession(String email) {
        return sessions.get(email);
    }
}
