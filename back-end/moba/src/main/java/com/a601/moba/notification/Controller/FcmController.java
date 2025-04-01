package com.a601.moba.notification.Controller;

import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.Controller.Request.CreateFcmTokenRequest;
import com.a601.moba.notification.Controller.Request.DeleteFcmTokenRequest;
import com.a601.moba.notification.Service.FcmTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/fcm")
public class FcmController {

    private final FcmTokenService fcmTokenService;
    private final AuthUtil authUtil;

    @PostMapping
    public ResponseEntity<JSONResponse<Void>> createFcmToken(@RequestBody CreateFcmTokenRequest createRequestDto) {
        Member member = authUtil.getCurrentMember();
        fcmTokenService.saveToken(createRequestDto.token(), member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SAVE_FCM_TOKEN_SUCCESS));
    }

    @DeleteMapping
    public ResponseEntity<JSONResponse<Void>> deleteFcmToken(@RequestBody DeleteFcmTokenRequest deleteRequestDto) {
        Member member = authUtil.getCurrentMember();
        fcmTokenService.deleteToken(deleteRequestDto.token(), member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.DELETE_FCM_TOKEN_SUCCESS));
    }


}
