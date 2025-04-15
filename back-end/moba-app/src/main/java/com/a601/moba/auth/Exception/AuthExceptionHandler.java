package com.a601.moba.auth.Exception;

import com.a601.moba.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Hidden
@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(AuthException.class)
    public ResponseEntity<JSONResponse<Void>> handleAuthException(AuthException e) {
        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(JSONResponse.onFailure(e.getErrorCode()));
    }
}
