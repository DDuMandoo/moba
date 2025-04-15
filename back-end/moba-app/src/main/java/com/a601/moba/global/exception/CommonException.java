package com.a601.moba.global.exception;

import com.a601.moba.global.code.ErrorCode;
import lombok.Getter;

@Getter
public class CommonException extends RuntimeException {
    private final ErrorCode errorCode;

    public CommonException(ErrorCode errorCode) {
        this.errorCode = errorCode;
    }
}
