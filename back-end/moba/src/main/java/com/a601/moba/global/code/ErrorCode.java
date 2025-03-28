package com.a601.moba.global.code;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 서버 에러
    SERVER_ERROR(5000, INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다"),

    // 요청 관련 에러
    INVALID_REQUEST(4000, BAD_REQUEST, "잘못된 요청 형식입니다"),

    INVALID_BANK_ID(4001, BAD_REQUEST, "존재하지 않는 은행 코드 입니다"),
    INVALID_BANK_TOKEN(4002, BAD_REQUEST, "유효하지 않은 토큰입니다"),
    INVALID_BANK_NAME(4003, BAD_REQUEST, "은행 이름이 일치하지 않습니다"),
    INVALID_ACCOUNT_ID(4006, BAD_REQUEST, "존재하지 않는 계좌입니다"),
    INSUFFICIENT_BALANCE(4007, BAD_REQUEST, "잔액이 부족합니다"),
    INVALID_AMOUNT(4008, BAD_REQUEST,"입출금 금액은 0보다 커야 합니다"),
    TRANSFER_ACCOUNT_DUPLICATE(4009, BAD_REQUEST, "자기 자신한테는 이체할 수 없습니다"),

    ;

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
