package com.a601.moba.email.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class EmailVerificationException extends CommonException {
    public EmailVerificationException(ErrorCode errorCode) {
        super(errorCode);
    }
}

