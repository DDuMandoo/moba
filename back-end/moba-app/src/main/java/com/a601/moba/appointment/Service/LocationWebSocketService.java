package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Exception.AppointmentException;
import com.a601.moba.appointment.Util.LocationWebSocketHandler;
import com.a601.moba.global.code.ErrorCode;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationWebSocketService {

    private final LocationWebSocketHandler webSocketHandler;

    // 특정 사용자에게 위치 요청
    public void requestLocation(String email) {
        WebSocketSession session = webSocketHandler.getSession(email);

        if (session == null) {
            log.error("🔴 위치 요청 실패: 사용자 {}의 WebSocket 세션을 찾을 수 없음", email);
            return;
        }

        if (!session.isOpen()) {
            log.warn("🔴 위치 요청 실패: 사용자 {}의 WebSocket 세션이 닫혀 있음", email);
            return;
        }

        try {
            log.info("사용자 {}에게 위치 정보 요청", email);
            session.sendMessage(new TextMessage("{\"type\": \"request_location\"}"));
        } catch (IOException e) {
            log.error("위치 요청 중 오류 발생 (사용자 {}): {}", email, e.getMessage());
            throw new AppointmentException(ErrorCode.APPOINTMENT_LOCATION_FAIL);
        }
    }
}
