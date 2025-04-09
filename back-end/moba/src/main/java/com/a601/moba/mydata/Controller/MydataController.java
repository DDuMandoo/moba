package com.a601.moba.mydata.Controller;

import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.mydata.Controller.Request.AuthMydataRequest;
import com.a601.moba.mydata.Controller.Request.SendCodeMydataRequest;
import com.a601.moba.mydata.Controller.Response.ReadMydataResponse;
import com.a601.moba.mydata.Service.MydataService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mydatas")
@Tag(name = "마이데이터", description = "마이데이터 조회 및 SMS 인증")
public class MydataController {

    private final MydataService mydataService;

    @Operation(summary = "마이데이터 조회", description = "현재 로그인한 회원의 마이데이터 조회")
    @GetMapping
    public ResponseEntity<JSONResponse<ReadMydataResponse>> read() {
        ReadMydataResponse response = mydataService.read();

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.READ_MYDATA_SUCCESS, response));
    }

    @Operation(summary = "SMS 인증 문자 전송", description = "문자 전송 후 /auth 로 api 요청 한번 더 해야함")
    @PostMapping("/send")
    public ResponseEntity<JSONResponse<String>> sendCode(
            @RequestBody SendCodeMydataRequest request
    ) {
        mydataService.sendCode(request.phoneNumber());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEND_CODE_SUCCESS));
    }

    @Operation(summary = "SMS 인증 확인", description = "SMS 인증 성공 시 SMS 인증 상태 변경, /read 로 api 요청 한번 더 해야함")
    @PostMapping("/auth")
    public ResponseEntity<JSONResponse<String>> auth(
            @RequestBody AuthMydataRequest request
    ) {
        log.info(request.code());
        mydataService.verifyCode(request.code());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.AUTH_CODE_SUCCESS));
    }
}
