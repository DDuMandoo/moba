package com.a601.moba.wallet.Exception;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.exception.CommonException;

public class WalletAuthException extends CommonException {
    public WalletAuthException(ErrorCode errorCode) {
        super(errorCode);
    }
}
