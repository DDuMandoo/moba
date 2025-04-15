package com.a601.moba.notification.exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class SendAppointmentException extends CommonException {
    public SendAppointmentException(ErrorCode errorCode) {
        super(errorCode);
    }
}
