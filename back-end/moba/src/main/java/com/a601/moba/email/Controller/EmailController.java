package com.a601.moba.email.Controller;

import com.a601.moba.email.Controller.Request.EmailSendRequest;
import com.a601.moba.email.Controller.Request.EmailVerifyRequest;
import com.a601.moba.email.Exception.EmailVerificationException;
import com.a601.moba.email.Service.EmailService;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
@Tag(name = "이메일 인증", description = "이메일 인증 코드 발송 및 인증 확인 API")
public class EmailController {

    private final EmailService emailService;

    @Operation(summary = "이메일 인증 코드 전송", description = "사용자의 이메일로 인증 코드를 전송합니다.")
    @PostMapping("/send")
    public ResponseEntity<JSONResponse<Void>> sendVerificationCode(@RequestBody EmailSendRequest request) {
        emailService.sendVerificationCode(request.email());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.EMAIL_SENT_SUCCESS));
    }

    @Operation(summary = "인증 코드 확인", description = "사용자가 입력한 인증 코드가 유효한지 검증합니다.")
    @PostMapping("/verify")
    public ResponseEntity<JSONResponse<Boolean>> verifyCode(@RequestBody EmailVerifyRequest request) {
        boolean isValid = emailService.verifyCode(request.email(), request.code());

        if (!isValid) {
            throw new EmailVerificationException(ErrorCode.INVALID_VERIFICATION_CODE);
        }

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.EMAIL_VERIFIED_SUCCESS, true));

    }

}
