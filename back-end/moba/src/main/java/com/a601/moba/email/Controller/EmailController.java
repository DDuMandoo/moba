package com.a601.moba.email.Controller;

import com.a601.moba.email.Controller.Request.EmailSendRequest;
import com.a601.moba.email.Controller.Request.EmailVerifyRequest;
import com.a601.moba.email.Service.EmailService;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emails")
@RequiredArgsConstructor
public class EmailController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<JSONResponse<Void>> sendVerificationCode(@RequestBody EmailSendRequest request) {
        emailService.sendVerificationCode(request.getEmail());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.EMAIL_SENT_SUCCESS));
    }

    @PostMapping("/verify")
    public ResponseEntity<JSONResponse<Boolean>> verifyCode(@RequestBody EmailVerifyRequest request) {
        boolean isValid = emailService.verifyCode(request.getEmail(), request.getCode());

        if (isValid) {
            return ResponseEntity.ok(JSONResponse.of(SuccessCode.EMAIL_VERIFIED_SUCCESS, true));
        } else {
            return ResponseEntity
                    .badRequest()
                    .body(JSONResponse.onFailure(ErrorCode.INVALID_VERIFICATION_CODE, false));
        }
    }

}
