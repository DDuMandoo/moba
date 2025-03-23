package com.a601.moba.global.code;

import static org.springframework.http.HttpStatus.OK;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    REQUEST_SUCCESS(2000, OK, "요청이 성공적으로 처리되었습니다"),
    LOGOUT_SUCCESS(2001, OK, "로그아웃에 성공하였습니다."),
    PASSWORD_RESET_SUCCESS(2100, OK, "임시 비밀번호 전송을 성공하였습니다"),
    EMAIL_VERIFIED_SUCCESS(2150, OK, "이메일 인증을 성공하였습니다"),
    EMAIL_SENT_SUCCESS(2002, OK, "이메일 전송에 성공하였습니다");


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
