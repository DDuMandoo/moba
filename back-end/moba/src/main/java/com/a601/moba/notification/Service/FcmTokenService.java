package com.a601.moba.notification.Service;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.Controller.Request.NotificationRequest;
import com.a601.moba.notification.Entity.FcmToken;
import com.a601.moba.notification.Repository.FcmTokenRepository;
import com.a601.moba.notification.exception.FcmTokenSaveException;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import jakarta.transaction.Transactional;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FcmTokenService {

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

    public void send(NotificationRequest dto, Member receiver) throws FirebaseMessagingException {
        FcmToken token = fcmTokenRepository.findByMember(receiver)
                .orElseThrow(() -> new RuntimeException("FCM 토큰이 존재하지 않습니다."));

        Message message = Message.builder()
                .setToken(token.getToken())
                .setNotification(Notification.builder()
                        .setTitle(dto.title())
                        .setBody(dto.body())
                        .build())
                .putData("route", dto.deepLink())
                .putData("type", String.valueOf(dto.type()))
                .build();

        String response = FirebaseMessaging.getInstance().send(message);
        log.info("FCM 푸시 전송 성공: {}", response);
    }
}
