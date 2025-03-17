package com.a601.moba.global.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    ;

    private final int code;
    private final HttpStatus httpStatus;
}
