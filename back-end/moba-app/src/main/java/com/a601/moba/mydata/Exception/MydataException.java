package com.a601.moba.mydata.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class MydataException extends CommonException {
    public MydataException(ErrorCode errorCode) {
        super(errorCode);
    }
}
