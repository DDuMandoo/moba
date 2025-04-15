package com.a601.moba.wallet.Controller;

import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.wallet.Controller.Request.AuthAccountRequest;
import com.a601.moba.wallet.Controller.Request.AuthWalletRequest;
import com.a601.moba.wallet.Controller.Request.ChangeMainAccountRequest;
import com.a601.moba.wallet.Controller.Request.ConnectAccountRequest;
import com.a601.moba.wallet.Controller.Request.DepositWalletRequest;
import com.a601.moba.wallet.Controller.Request.SetPasswordRequest;
import com.a601.moba.wallet.Controller.Request.TransferWalletRequest;
import com.a601.moba.wallet.Controller.Request.WithdrawWalletRequest;
import com.a601.moba.wallet.Controller.Response.ConnectAccountResponse;
import com.a601.moba.wallet.Controller.Response.DepositWalletResponse;
import com.a601.moba.wallet.Controller.Response.GetAccountResponse;
import com.a601.moba.wallet.Controller.Response.GetBalanceResponse;
import com.a601.moba.wallet.Controller.Response.GetTransactionResponse;
import com.a601.moba.wallet.Controller.Response.TransferWalletResponse;
import com.a601.moba.wallet.Controller.Response.WithdrawWalletResponse;
import com.a601.moba.wallet.Service.WalletService;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;
    private final AuthUtil authUtil;

    @PostMapping("/account")
    public ResponseEntity<JSONResponse<String>> connectAccount(
            @RequestBody ConnectAccountRequest request) {
        walletService.connectAccount(
                request.account(),
                request.bank());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.WALLET_SENT_SUCCESS));
    }

    @PostMapping("/account/auth")
    public ResponseEntity<JSONResponse<ConnectAccountResponse>> authAccount(
            @RequestBody AuthAccountRequest request
    ) {
        ConnectAccountResponse response = walletService.authAccount(
                request.code(),
                request.account(),
                request.bank());

        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    @PatchMapping("/main")
    public ResponseEntity<JSONResponse<String>> changeMainAccount(
            @RequestBody ChangeMainAccountRequest request
    ) {
        walletService.changeMainAccount(request.account());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.MAIN_ACCOUNT_SET_SUCCESS));
    }

    @GetMapping("/account")
    public ResponseEntity<JSONResponse<GetAccountResponse>> getAccount() {
        GetAccountResponse response = walletService.getAccount();
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.GET_ACCOUNT_LIST_SUCCESS, response));
    }

    @GetMapping
    public ResponseEntity<JSONResponse<GetBalanceResponse>> getBalance() {
        GetBalanceResponse response = walletService.getBalance();
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.GET_WALLET_BALANCE_SUCCESS, response));
    }

    @PostMapping("/deposit")
    public ResponseEntity<JSONResponse<DepositWalletResponse>> deposit(
            @RequestBody DepositWalletRequest request
    ) {
        DepositWalletResponse response = walletService.deposit(
                request.account(),
                request.amount());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.CHARGE_WALLET_SUCCESS, response));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<JSONResponse<WithdrawWalletResponse>> withdraw(
            @RequestBody WithdrawWalletRequest request
    ) {
        WithdrawWalletResponse response = walletService.withdraw(
                request.account(),
                request.amount());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.EXCHANGE_WALLET_SUCCESS, response));
    }

    @PostMapping("/transfer")
    public ResponseEntity<JSONResponse<TransferWalletResponse>> transfer(
            @RequestBody TransferWalletRequest request
    ) {
        TransferWalletResponse response = walletService.transferWallet(
                request.memberId(),
                request.amount());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEND_WALLET_SUCCESS, response));
    }

    //지갑 간편 비밀 번호 설정
    @PatchMapping("/password")
    ResponseEntity<JSONResponse<String>> setPassword(
            @RequestBody SetPasswordRequest request
    ) {
        walletService.setPassword(request.password());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SET_PASSWORD_SUCCESS));
    }

    @PostMapping("/auth")
    ResponseEntity<JSONResponse<String>> auth(
            @RequestBody AuthWalletRequest request
    ) {
        walletService.auth(request.password());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.AUTH_WALLET_SUCCESS));
    }

    @GetMapping("/transaction")
    ResponseEntity<JSONResponse<GetTransactionResponse>> getTransaction(
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) Integer cursorId,
            @RequestParam(required = false) LocalDateTime cursorPayAt
    ) {
        Pageable pageable = PageRequest.of(0, size);
        GetTransactionResponse response = walletService.getTransaction(pageable, cursorId, cursorPayAt);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.WALLET_GET_SUCCESS, response));
    }

    @GetMapping("/transaction/deposit")
    ResponseEntity<JSONResponse<GetTransactionResponse>> getDepositTransaction(
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) Integer cursorId,
            @RequestParam(required = false) LocalDateTime cursorPayAt
    ) {
        Pageable pageable = PageRequest.of(0, size);
        GetTransactionResponse response = walletService.getDepositTransaction(pageable, cursorId, cursorPayAt);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.WALLET_GET_SUCCESS, response));
    }

    @GetMapping("/transaction/withdraw")
    ResponseEntity<JSONResponse<GetTransactionResponse>> getWithdrawTransaction(
            @RequestParam(defaultValue = "20") Integer size,
            @RequestParam(required = false) Integer cursorId,
            @RequestParam(required = false) LocalDateTime cursorPayAt
    ) {
        Pageable pageable = PageRequest.of(0, size);
        GetTransactionResponse response = walletService.getWithdrawTransaction(pageable, cursorId, cursorPayAt);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.WALLET_GET_SUCCESS, response));
    }
}
