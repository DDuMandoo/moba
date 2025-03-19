package com.a601.moba.global.code;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.HttpClientErrorException.Unauthorized;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {
    // 서버 에러
    SERVER_ERROR(5000, INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다"),

    // 요청 관련 에러
    INVALID_REQUEST(4000, BAD_REQUEST, "잘못된 요청 형식입니다"),

    //인증
    //회원가입 관련 에러
    EMAIL_ALREADY_EXISTS(4090, CONFLICT, "이미 존재하는 이메일입니다"),

    //로그인 관련 에러
    INVALID_CREDENTIALS(4010,UNAUTHORIZED, "이메일 또는 비밀번호가 잘못되었습니다"),
    UNAUTHORIZED_ACCESS(4011, UNAUTHORIZED, "토큰이 없거나 틀렸습니다"),
    FORBIDDEN_ACCESS(4030, FORBIDDEN, "접근 권한이 없습니다"),
    //유저 인증(토큰) 에러
    INVALID_TOKEN(4012, UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    TOKEN_NOT_FOUND(4013, UNAUTHORIZED, "토큰이 제공되지 않았습니다"),
    INVALID_REFRESH_TOKEN(4014, UNAUTHORIZED, "유효하지 않은 Refresh Token입니다")
    ;

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
