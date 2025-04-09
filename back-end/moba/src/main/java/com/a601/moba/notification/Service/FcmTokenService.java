package com.a601.moba.notification.Service;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.controller.Request.NotificationRequest;
import com.a601.moba.notification.entity.FcmToken;
import com.a601.moba.notification.exception.FcmTokenSaveException;
import com.a601.moba.notification.repository.FcmTokenRepository;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.AndroidNotification;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.transaction.Transactional;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

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

    public void deleteToken(Member member) {
        boolean exists = fcmTokenRepository.existsByMember(member);
        if (!exists) {
            log.info("삭제하려는 토큰이 존재하지 않습니다.");
            return;
        }

        fcmTokenRepository.deleteByMember(member);
    }

    public void send(NotificationRequest dto, Member receiver) throws FirebaseMessagingException {
        FcmToken token = fcmTokenRepository.findByMember(receiver)
                .orElse(null);

        if (token == null) {
            log.error("Expo 푸시 토큰이 존재하지 않습니다.");
            return;
        }
        Message message = Message.builder()
                .setToken(token.getToken())
                .setNotification(Notification.builder()
                        .setTitle(dto.title())
                        .setBody(dto.body())
                        .build())
                .setAndroidConfig(AndroidConfig.builder()
                        .setPriority(AndroidConfig.Priority.HIGH)
                        .setNotification(AndroidNotification.builder()
                                .setIcon("icon")
                                .setClickAction("FLUTTER_NOTIFICATION_CLICK")
                                .build())
                        .build())
                .putData("link", "moyo://" + dto.deepLink())
                .putData("click_action", "FLUTTER_NOTIFICATION_CLICK")
                .putData("type", String.valueOf(dto.type()))
                .build();

        String response = FirebaseMessaging.getInstance().send(message);
        log.info("FCM 푸시 전송 성공: {}", response);
    }

//    public void send(NotificationRequest dto, Member receiver) throws RuntimeException {
//        FcmToken token = fcmTokenRepository.findByMember(receiver)
//                .orElse(null);
//
//        if (token == null) {
//            log.error("Expo 푸시 토큰이 존재하지 않습니다.");
//            return;
//        }
//        // 요청 바디 구성
//        Map<String, Object> payload = new HashMap<>();
//        payload.put("to", token.getToken());
//        payload.put("title", dto.title());
//        payload.put("body", dto.body());
//        payload.put("data", Map.of(
//                "route", dto.deepLink(),
//                "type", String.valueOf(dto.type())
//        ));
//
//        // Expo Push API 호출
//        webClient.post()
//                .uri("/--/api/v2/push/send")
//                .header("Content-Type", "application/json")
//                .bodyValue(payload)
//                .retrieve()
//                .bodyToMono(String.class)
//                .doOnNext(response -> {
//                    log.info("Expo 푸시 전송 성공: {}", response);
//
//                    // 유효하지 않은 토큰 감지
//                    if (response.contains("DeviceNotRegistered")) {
//                        log.warn("Expo 토큰이 만료되었거나 등록 해제됨. 삭제 처리: {}", token.getToken());
//                        fcmTokenRepository.delete(token);
//                    }
//                })
//                .onErrorResume(error -> {
//                    log.error("Expo 푸시 전송 실패: {}", error.getMessage());
//                    return Mono.empty();
//                })
//                .subscribe(); // 비동기 처리
//    }

}
