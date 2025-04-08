package com.a601.moba.mydata.Controller;

import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.mydata.Controller.Request.AuthMydataRequest;
import com.a601.moba.mydata.Controller.Request.SendCodeMydataRequest;
import com.a601.moba.mydata.Controller.Response.ReadMydataResponse;
import com.a601.moba.mydata.Controller.Response.ReadMydataWithTokenResponse;
import com.a601.moba.mydata.Service.MydataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/mydatas")
public class MydataController {

    private final MydataService mydataService;

    @GetMapping
    public ResponseEntity<JSONResponse<ReadMydataResponse>> read() {
        ReadMydataResponse response = mydataService.read();

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.READ_MYDATA_SUCCESS, response));
    }

    @PostMapping("/send")
    public ResponseEntity<JSONResponse<String>> sendCode(
            @RequestBody SendCodeMydataRequest request
    ) {
        mydataService.sendCode(request.phoneNumber());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEND_CODE_SUCCESS));
    }

    @PostMapping("/auth")
    public ResponseEntity<JSONResponse<ReadMydataWithTokenResponse>> auth(
            @RequestBody AuthMydataRequest request
    ) {
        ReadMydataWithTokenResponse response = mydataService.auth(request.code());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.AUTH_CODE_SUCCESS, response));
    }
}
