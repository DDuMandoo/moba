package com.a601.moba.wallet.Exception;

import com.a601.moba.global.response.JSONResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class WalletAuthExceptionHandler {

    @ExceptionHandler(WalletAuthException.class)
    public ResponseEntity<JSONResponse<Void>> handleWalletAuthException(WalletAuthException e) {
        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(JSONResponse.onFailure(e.getErrorCode()));
    }
}