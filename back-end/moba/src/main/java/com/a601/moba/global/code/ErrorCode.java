package com.a601.moba.global.code;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.FORBIDDEN;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.TOO_MANY_REQUESTS;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

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

    // ================= 인증/회원가입 관련 에러 (4100번대) =================
    EMAIL_ALREADY_EXISTS(4100, CONFLICT, "이미 존재하는 이메일입니다"),
    EMAIL_NOT_FOUND(4101, NOT_FOUND, "해당 이메일을 가진 사용자가 없습니다"),
    INVALID_CREDENTIALS(4102, UNAUTHORIZED, "이메일 또는 비밀번호가 잘못되었습니다"),
    UNAUTHORIZED_ACCESS(4103, UNAUTHORIZED, "토큰이 없거나 틀렸습니다"),
    FORBIDDEN_ACCESS(4104, FORBIDDEN, "접근 권한이 없습니다"),
    ALREADY_DELETED_MEMBER(4105, BAD_REQUEST, "이미 탈퇴된 회원입니다"),
    MEMBER_NOT_FOUND(4106, NOT_FOUND, "사용자가 존재하지 않습니다."),
    MEMBER_NOT_FOUND_IN_LIST(4107, NOT_FOUND, "해당 리스트에 사용자가 존재하지 않습니다."),

    // ================= 토큰 관련 에러 (4200번대) =================
    INVALID_TOKEN(4200, UNAUTHORIZED, "유효하지 않은 토큰입니다"),
    TOKEN_NOT_FOUND(4201, UNAUTHORIZED, "토큰이 제공되지 않았습니다"),
    INVALID_REFRESH_TOKEN(4202, UNAUTHORIZED, "유효하지 않은 Refresh Token입니다"),

    // ================= 이메일 인증 관련 에러 (4300번대) =================
    EXPIRED_VERIFICATION_CODE(4300, BAD_REQUEST, "인증 코드가 만료되었습니다."),
    INVALID_VERIFICATION_CODE(4301, BAD_REQUEST, "인증 코드가 일치하지 않습니다."),
    EMAIL_ALREADY_VERIFIED(4302, CONFLICT, "이미 인증된 이메일입니다."),
    EMAIL_NOT_VERIFIED(4303, FORBIDDEN, "검증되지 않은 이메일입니다."),
    TOO_MANY_PASSWORD_RESET_REQUESTS(4304, TOO_MANY_REQUESTS, "비밀번호 재설정 요청이 너무 많습니다."),
    PASSWORD_RESET_FAILED(4304, TOO_MANY_REQUESTS, "비밀번호 재설정에 실패하였습니다"),

    // ================= 약속 관련 에러 (4400번대) ==================
    INVITE_CODE_GENERATION_FAILED(4400, INTERNAL_SERVER_ERROR, "초대 코드 생성에 실패했습니다"),
    APPOINTMENT_SAVE_FAILED(4401, INTERNAL_SERVER_ERROR, "약속 정보 저장에 실패했습니다"),
    APPOINTMENT_PARTICIPANT_SAVE_FAILED(4402, INTERNAL_SERVER_ERROR, "약속 참여자 저장에 실패했습니다"),
    APPOINTMENT_NOT_FOUND(4403, NOT_FOUND, "존재하지 않는 약속방입니다"),
    APPOINTMENT_ALREADY_JOINED(4404, CONFLICT, "이미 참여한 약속방입니다"),
    APPOINTMENT_JOIN_FORBIDDEN(4405, FORBIDDEN, "해당 약속방에 참여할 수 없습니다"),
    APPOINTMENT_PARTICIPANT_NOT_FOUND(4406, NOT_FOUND, "약속방 참여자를 찾을 수 없습니다"),
    APPOINTMENT_ACCESS_DENIED(4407, FORBIDDEN, "약속방에 대한 접근 권한이 없습니다. 또는 해당 약속방 참여자가 아닙니다"),
    APPOINTMENT_IMAGE_UPLOAD_FAILED(4408, INTERNAL_SERVER_ERROR, "약속 이미지 업로드에 실패했습니다"),
    APPOINTMENT_PARTICIPANT_LIMIT_EXCEEDED(4409, BAD_REQUEST, "약속방 참여 인원 제한을 초과하였습니다"),
    APPOINTMENT_EXIT_FORBIDDEN(4410, FORBIDDEN, "방장은 약속방을 나갈 수 없습니다"),
    APPOINTMENT_KICK_FORBIDDEN(4410, FORBIDDEN, "방장을 강제로 퇴장시킬 수 없습니다."),
    APPOINTMENT_PLACE_NOT_FOUND(4411, NOT_FOUND, "약속 장소 리스트에서 해당 장소를 찾을 수 없습니다"),
    APPOINTMENT_LOCATION_FAIL(4412, INTERNAL_SERVER_ERROR, "사용자의 위치를 가져오는데 실패햐였습니다"),
    INVALID_APPOINTMENT_TIME(4413, BAD_REQUEST, "아직 약속 시간 10분 전이 아닙니다"),
    APPOINTMENT_NOT_HOST(4414, BAD_REQUEST, "약속방 방장만 가능한 기능입니다"),

    // ================= 장소 관련 에러 (4450번대) ==================
    PLACE_NOT_FOUND(4450, NOT_FOUND, "해당 장소를 찾을 수 없습니다"),

    // ================= 지갑 관련 에러 (4500번대) ==================
    INVALID_WALLET(4500, BAD_REQUEST, "존재하지 않는 지갑입니다"),
    INVALID_VERIFICATION_ACCOUNT(4501, BAD_REQUEST, "존재하지 않는 계좌입니다"),
    INVALID_VERIFICATION_ACCOUNT_CODE(4502, BAD_REQUEST, "유효하지 않는 코드 입니다"),
    INVALID_AMOUNT(4503, BAD_REQUEST, "입출금 금액은 0보다 커야 합니다"),
    INSUFFICIENT_BALANCE(4504, BAD_REQUEST, "잔액이 부족합니다"),
    TRANSFER_ACCOUNT_DUPLICATE(4505, BAD_REQUEST, "자기 자신한테는 이체할 수 없습니다"),
    DUPLICATE_CONNECT_ACCOUNT(4506, BAD_REQUEST, "이미 연결된 계좌입니다"),
    FAIL_CHARGE_ACCOUNT(4507, INTERNAL_SERVER_ERROR, "지갑 충전 중 문제가 발생했습니다"),
    INVALID_PASSWORD_FORM(4508, BAD_REQUEST, "간편 비밀번호는 6자여야 합니다"),
    INVALID_WALLET_PASSWORD(4509, BAD_REQUEST, "비밀번호가 틀렸습니다"),
    NOT_FOUND_TRANSACTION(4510, NOT_FOUND, "존재하지 않는 거래 내역입니다"),

    // ================= S3 관련 에러 (4600번대) ==================
    S3_UPLOAD_FAILED(4600, INTERNAL_SERVER_ERROR, "S3 파일 업로드에 실패했습니다"),
    S3_DELETE_FAILED(4601, INTERNAL_SERVER_ERROR, "S3 파일 삭제에 실패했습니다"),


    // ================= 더치페이 관련 에러 (4700번대) ==================
    NOT_FOUND_DUTCHPAY(4700, NOT_FOUND, "더치페이를 찾을 수 없습니다"),
    NOT_FOUND_DUTCHPAY_PARTICIPANT(4701, NOT_FOUND, "더치페이 참여자를 찾을 수 없습니다"),
    NOT_MATCH_AMOUNT(4702, BAD_REQUEST, "정산이 완료되지 않았습니다"),
    NOT_MATCH_PRICE(4703, BAD_REQUEST, "합산 금액이 일치하지 않습니다"),
    INVALID_HOST(4704, BAD_REQUEST, "더치페이 호스트의 권한이 없습니다"),
    ALREADY_COMPLETE_DUTCHPAY(4705, BAD_REQUEST, "이미 더치페이 완료한 참가자 입니다"),
    FAILED_OCR_IMAGE(4706, INTERNAL_SERVER_ERROR, "영수증 ocr에 실패하였습니다"),
    FAILED_CREATE_DUTCHPAY(4706, INTERNAL_SERVER_ERROR, "더치페이를 생성할 수 없습니다."),

    // ================= FCM 관련 에러 (4800번대) ==================
    FCM_TOKEN_NOT_FOUND(4801, BAD_REQUEST, "FCM 토큰이 존재하지 않습니다"),
    FCM_SEND_FAILED(4802, INTERNAL_SERVER_ERROR, "FCM 알림 전송에 실패했습니다"),
    FCM_INVALID_TOKEN(4803, BAD_REQUEST, "유효하지 않은 FCM 토큰입니다"),
    FCM_TOKEN_SAVE_FAILED(4804, INTERNAL_SERVER_ERROR, "FCM 토큰 저장에 실패했습니다"),
    FCM_TOKEN_DELETE_FAILED(4805, INTERNAL_SERVER_ERROR, "FCM 토큰 삭제에 실패했습니다"),
    FCM_TOKEN_SEND_APPOINTMENT(4806, INTERNAL_SERVER_ERROR, "FCM에서 약속 리마인더 알림 전송에 실패했습니다."),
    FCM_TOKEN_SEND_APPOINTMENT_MYSERVER(4807, INTERNAL_SERVER_ERROR, "앱 서버에서 약속 리마인더 알림 전송에 실패했습니다."),

    // ================= 마이데이터 관련 에러 (4900번대) ==================
    MYDATA_ACCESS_FAILED(4900, UNAUTHORIZED, "마이데이터 토큰이 없거나 만료되었습니다. 인증 절차를 진행해 주세요"),
    INVALID_SMS_CODE(4901, BAD_REQUEST, "SMS 인증 코드가 일치하지 않습니다"),

    ;
    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
