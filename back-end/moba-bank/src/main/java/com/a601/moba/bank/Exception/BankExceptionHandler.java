package com.a601.moba.bank.Exception;

import com.a601.moba.global.response.JSONResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class BankExceptionHandler {

    @ExceptionHandler(BankException.class)
    public ResponseEntity<JSONResponse<Void>> handleAuthException(BankException e) {
        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(JSONResponse.onFailure(e.getErrorCode()));
    }
}
