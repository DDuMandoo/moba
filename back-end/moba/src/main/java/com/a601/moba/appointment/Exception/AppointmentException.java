package com.a601.moba.appointment.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class AppointmentException extends CommonException {
    public AppointmentException(ErrorCode errorCode) {
        super(errorCode);
    }
}
