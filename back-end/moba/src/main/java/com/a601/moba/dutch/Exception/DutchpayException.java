package com.a601.moba.dutch.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class DutchpayException extends CommonException {
    public DutchpayException(ErrorCode errorCode) {
        super(errorCode);
    }
}
