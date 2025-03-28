package com.a601.moba.bank.Controller;

import com.a601.moba.bank.Controller.Request.CreateBankRequest;
import com.a601.moba.bank.Controller.Request.TransferBankRequest;
import com.a601.moba.bank.Controller.Response.CreateBankResponse;
import com.a601.moba.bank.Service.BankService;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/banks")
public class BankController {

    private final BankService bankService;

    //계좌 생성
    @PostMapping("/create")
    public ResponseEntity<JSONResponse<CreateBankResponse>> createAccount(
            @RequestBody CreateBankRequest request
    ){
        CreateBankResponse response = bankService.createAccount(
                request.bankId(),
                request.name(),
                request.password()
        );

        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    // 이체 요청
    @PostMapping("/transfer")
    public ResponseEntity<JSONResponse<String>> transfer(
            @RequestBody TransferBankRequest request
    ){
        bankService.transfer(
                request.accessToken(),
                request.target(),
                request.amount(),
                request.name());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.TRANSFER_SUCCESS));
    }

}
