package com.a601.moba.global.code;

import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.OK;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum SuccessCode {
    REQUEST_SUCCESS(2000, OK, "요청이 성공적으로 처리되었습니다"),
    SEARCH_SUCCESS(2001, OK, "조회에 성공했습니다"),

    // ================= 인증 / 로그인 관련 성공 (2100번대) =================
    SIGNIN_SUCCESS(2100, OK, "로그인에 성공하였습니다"),
    SIGNOUT_SUCCESS(2101, OK, "로그아웃에 성공하였습니다."),

    // ================= 이메일 관련 성공 (2200번대) =================
    EMAIL_SENT_SUCCESS(2200, OK, "이메일 전송에 성공하였습니다"),
    EMAIL_VERIFIED_SUCCESS(2201, OK, "이메일 인증을 성공하였습니다"),

    // ================= 비밀번호 / 계정 관련 성공 (2300번대) =================
    MEMBER_DELETE_SUCCESS(2300, OK, "성공적으로 회원탈퇴 되었습니다"),
    PASSWORD_RESET_SUCCESS(2301, OK, "임시 비밀번호 전송을 성공하였습니다"),
    PROFILE_IMAGE_UPLOAD_SUCCESS(2302, OK, "프로필 이미지 업로드 성공하였습니다"),
    PASSWORD_AUTHENTICATION_SUCCESS(2303, OK, "비밀번호 인증에 성공하였습니다."),

    // ================= 약속 관련 성공 (2400번대) ==================
    APPOINTMENT_CREAT_SUCCESS(2400, CREATED, "약속방 생성을 성공하였습니다"),
    APPOINTMENT_JOIN_SUCCESS(2401, OK, "약속방 참여에 성공하였습니다"),
    APPOINTMENT_READ_SUCCESS(2402, OK, "약속방 정보 조회에 성공하였습니다"),
    APPOINTMENT_UPDATE_SUCCESS(2403, OK, "약속방 정보를 수정하였습니다"),
    APPOINTMENT_END_SUCCESS(2404, OK, "약속방 종료에 성공하였습니다"),
    APPOINTMENT_EXIT_SUCCESS(2405, OK, "약속방에서 성공적으로 나갔습니다"),
    APPOINTMENT_PARTICIPANTS_FETCH_SUCCESS(2406, OK, "참여자 목록 조회에 성공하였습니다"),
    APPOINTMENT_IMAGE_UPLOAD_SUCCESS(2407, OK, "약속 이미지 업로드에 성공하였습니다"),
    APPOINTMENT_IMAGE_DELETE_SUCCESS(2408, OK, "약속 이미지 삭제에 성공하였습니다"),
    APPOINTMENT_PARTICIPANT_KICK_SUCCESS(2409, OK, "멤버를 강제 퇴장시켰습니다"),
    APPOINTMENT_STATISTICS_SUCCESS(2410, OK, "약속 통계 조회에 성공하였습니다."),
    PLACE_ADD_SUCCESS(2411, OK, "가고 싶은 장소 추가에 성공했습니다"),

    // ================= 지갑 관련 성공 (2500번대) ==================
    WALLET_SENT_SUCCESS(2500, OK, "입력한 계좌로 1원 송금하는데 성공하였습니다"),
    MAIN_ACCOUNT_SET_SUCCESS(2501, OK, "주계좌 변경 성공하였습니다"),
    GET_ACCOUNT_LIST_SUCCESS(2502, OK, "계좌 리스트 조회 성공하였습니다"),
    GET_WALLET_BALANCE_SUCCESS(2503, OK, "지갑 잔액 조회에 성공했습니다"),
    CHARGE_WALLET_SUCCESS(2504, OK, "지갑 충전에 성공했습니다"),
    EXCHANGE_WALLET_SUCCESS(2505, OK, "계좌로 송금에 성공했습니다"),
    SEND_WALLET_SUCCESS(2506, OK, "지갑으로 송금에 성공했습니다"),
    SET_PASSWORD_SUCCESS(2507, OK, "간편 비밀번호 설정을 완료했습니다"),
    AUTH_WALLET_SUCCESS(2508, OK, "간편 비밀번호 인증에 성공했습니다"),
    WALLET_GET_SUCCESS(2509, OK, "지갑 거래 내역 조회에 성공했습니다"),

    ;


    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
