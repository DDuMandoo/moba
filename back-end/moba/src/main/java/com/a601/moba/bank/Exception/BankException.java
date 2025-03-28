package com.a601.moba.bank.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class BankException extends CommonException {
    public BankException(ErrorCode errorCode) {
        super(errorCode);
    }
}
