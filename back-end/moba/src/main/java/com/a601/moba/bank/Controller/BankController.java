package com.a601.moba.bank.Controller;

import com.a601.moba.bank.Controller.Request.CreateBankRequest;
import com.a601.moba.bank.Controller.Request.GetTransactionRequest;
import com.a601.moba.bank.Controller.Request.SearchTransactionRequest;
import com.a601.moba.bank.Controller.Request.TransferBankRequest;
import com.a601.moba.bank.Controller.Request.ValidBankRequest;
import com.a601.moba.bank.Controller.Response.CreateBankResponse;
import com.a601.moba.bank.Controller.Response.GetAccountResponse;
import com.a601.moba.bank.Controller.Response.GetReceiptResponse;
import com.a601.moba.bank.Controller.Response.GetTransactionResponse;
import com.a601.moba.bank.Controller.Response.SearchTransactionResponse;
import com.a601.moba.bank.Controller.Response.TransferBankResponse;
import com.a601.moba.bank.Controller.Response.ValidBankResponse;
import com.a601.moba.bank.Service.BankService;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
                request.uniqueId(),
                request.name(),
                request.password()
        );

        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    @GetMapping("/{uniqueId}/account")
    public ResponseEntity<JSONResponse<List<GetAccountResponse>>> getAccount(
            @PathVariable Integer uniqueId
    ){
        List<GetAccountResponse> responses = bankService.getAccount(uniqueId);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, responses));
    }

    @GetMapping("/transaction")
    public ResponseEntity<JSONResponse<List<GetTransactionResponse>>> getTransaction(
            @RequestBody GetTransactionRequest request
    ){
        List<GetTransactionResponse> responses = bankService.getTransaction(
                request.account(),
                request.password()
        );

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, responses));
    }

    // 이체 요청
    @PostMapping("/transfer")
    public ResponseEntity<JSONResponse<TransferBankResponse>> transfer(
            @RequestBody TransferBankRequest request
    ){
        TransferBankResponse response = bankService.transfer(
                request.accessToken(),
                request.target(),
                request.amount(),
                request.name());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.TRANSFER_SUCCESS, response));
    }

    // 계좌 연결 - 계좌 인증 토큰 발급
    @PostMapping("/valid")
    public ResponseEntity<JSONResponse<ValidBankResponse>> valid(
            @RequestBody ValidBankRequest request
    ){
        ValidBankResponse response = bankService.valid(
                request.uniqueId(),
                request.account(),
                request.bank()
        );

        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    @PostMapping("/search")
    public ResponseEntity<JSONResponse<SearchTransactionResponse>> searchTransaction(
            @RequestBody SearchTransactionRequest request
    ){
        SearchTransactionResponse response = bankService.searchTransaction(request.id(), request.accessToken());

        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    @GetMapping("/{uniqueId}/receipt")
    public ResponseEntity<JSONResponse<List<GetReceiptResponse>>> getReceipt(
            @PathVariable Integer uniqueId
    ){
        List<GetReceiptResponse> responses = bankService.getReceipt(uniqueId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, responses));
    }

}
