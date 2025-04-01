package com.a601.moba.notification.exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class FcmTokenSaveException extends CommonException {

    public FcmTokenSaveException(ErrorCode errorCode) {
        super(errorCode);
    }
}
