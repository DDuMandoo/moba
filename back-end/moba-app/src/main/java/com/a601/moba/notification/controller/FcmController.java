package com.a601.moba.notification.controller;

import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.Service.FcmTokenService;
import com.a601.moba.notification.controller.Request.CreateFcmTokenRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/fcm")
@Slf4j
public class FcmController {

    private final FcmTokenService fcmTokenService;
    private final AuthUtil authUtil;

    @PostMapping
    public ResponseEntity<JSONResponse<Void>> createFcmToken(@RequestBody CreateFcmTokenRequest createRequestDto) {
        Member member = authUtil.getCurrentMember();
        log.info(createRequestDto.token());
        fcmTokenService.saveToken(createRequestDto.token(), member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SAVE_FCM_TOKEN_SUCCESS));
    }

    @DeleteMapping
    public ResponseEntity<JSONResponse<Void>> deleteFcmToken() {
        Member member = authUtil.getCurrentMember();
        fcmTokenService.deleteToken(member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.DELETE_FCM_TOKEN_SUCCESS));
    }


}
