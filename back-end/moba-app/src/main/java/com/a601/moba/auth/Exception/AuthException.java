package com.a601.moba.auth.Exception;

import com.a601.moba.global.exception.CommonException;
import com.a601.moba.global.code.ErrorCode;

public class AuthException extends CommonException {
    public AuthException(ErrorCode errorCode) {
        super(errorCode);
    }
}
