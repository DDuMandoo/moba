package com.a601.moba.auth.Exception;

import com.a601.moba.global.response.JSONResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<JSONResponse<Void>> handleAuthException(AuthException e) {
        return ResponseEntity
                .status(e.getErrorCode().getCode() / 10) // 4090 → 409 상태 코드 반환
                .body(JSONResponse.onFailure(e.getErrorCode()));
    }
}
