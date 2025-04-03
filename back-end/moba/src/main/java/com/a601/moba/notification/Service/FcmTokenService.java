package com.a601.moba.notification.Service;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.controller.Request.NotificationRequest;
import com.a601.moba.notification.entity.FcmToken;
import com.a601.moba.notification.exception.FcmTokenSaveException;
import com.a601.moba.notification.repository.FcmTokenRepository;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FcmTokenService {


    private final WebClient webClient = WebClient.builder()
            .baseUrl("https://exp.host")
            .build();

    private final FcmTokenRepository fcmTokenRepository;

    public void saveToken(String token, Member member) {
        if (token == null || token.isBlank()) {
            throw new FcmTokenSaveException(ErrorCode.FCM_TOKEN_NOT_FOUND);
        }

        Optional<FcmToken> existingToken = fcmTokenRepository.findByMember(member);
        //기존에 토큰이 있으면 기존 토큰 삭제 후 저장
        if (existingToken.isPresent()) {
            FcmToken fcmToken = existingToken.get();

            if (!fcmToken.getToken().equals(token)) {
                fcmTokenRepository.deleteById(fcmToken.getToken());
                fcmTokenRepository.save(FcmToken.builder().token(token).member(member).build());
            }

        } else {
            fcmTokenRepository.save(FcmToken.builder().token(token).member(member).build());
        }
    }

    public void deleteToken(String token, Member member) {
        boolean exists = fcmTokenRepository.existsByMember(member);
        if (!exists) {
            log.info("삭제하려는 토큰이 존재하지 않습니다.");
            return;
        }

        fcmTokenRepository.deleteByMember(member);
    }

    public void send(NotificationRequest dto, Member receiver) {
        FcmToken token = fcmTokenRepository.findByMember(receiver)
                .orElseThrow(() -> new RuntimeException("Expo 푸시 토큰이 존재하지 않습니다."));

        // 요청 바디 구성
        Map<String, Object> payload = new HashMap<>();
        payload.put("to", token.getToken());
        payload.put("title", dto.title());
        payload.put("body", dto.body());
        payload.put("data", Map.of(
                "route", dto.deepLink(),
                "type", String.valueOf(dto.type())
        ));

        // Expo Push API 호출
        webClient.post()
                .uri("/--/api/v2/push/send")
                .header("Content-Type", "application/json")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(String.class)
                .doOnNext(response -> {
                    log.info("Expo 푸시 전송 성공: {}", response);

                    // 유효하지 않은 토큰 감지
                    if (response.contains("DeviceNotRegistered")) {
                        log.warn("Expo 토큰이 만료되었거나 등록 해제됨. 삭제 처리: {}", token.getToken());
                        fcmTokenRepository.delete(token);
                    }
                })
                .onErrorResume(error -> {
                    log.error("Expo 푸시 전송 실패: {}", error.getMessage());
                    return Mono.empty();
                })
                .subscribe(); // 비동기 처리
    }
}
