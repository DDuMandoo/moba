package com.a601.moba.wallet.Controller;

import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.wallet.Controller.Request.AuthAccountRequest;
import com.a601.moba.wallet.Controller.Request.ChangeMainAccountRequest;
import com.a601.moba.wallet.Controller.Request.ConnectAccountRequest;
import com.a601.moba.wallet.Controller.Request.DepositWalletRequest;
import com.a601.moba.wallet.Controller.Request.TransferWalletRequest;
import com.a601.moba.wallet.Controller.Request.WithdrawWalletRequest;
import com.a601.moba.wallet.Controller.Response.ConnectAccountResponse;
import com.a601.moba.wallet.Controller.Response.DepositWalletResponse;
import com.a601.moba.wallet.Controller.Response.GetAccountResponse;
import com.a601.moba.wallet.Controller.Response.GetBalanceResponse;
import com.a601.moba.wallet.Controller.Response.TransferWalletResponse;
import com.a601.moba.wallet.Controller.Response.WithdrawWalletResponse;
import com.a601.moba.wallet.Service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService walletService;
    private final AuthUtil authUtil;

    @PostMapping("/account")
    public ResponseEntity<JSONResponse<String>> connectAccount(
            HttpServletRequest request,
            @RequestBody ConnectAccountRequest connectAccountRequest) {
        Member member = authUtil.getMemberFromToken(request);

        walletService.connectAccount(member,
                connectAccountRequest.account(),
                connectAccountRequest.bank());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.WALLET_SENT_SUCCESS));
    }

    @PostMapping("/account/auth")
    public ResponseEntity<JSONResponse<ConnectAccountResponse>> authAccount(
            HttpServletRequest request,
            @RequestBody AuthAccountRequest authAccountRequest
    ) {
        Member member = authUtil.getMemberFromToken(request);

        ConnectAccountResponse response = walletService.authAccount(
                member,
                authAccountRequest.code(),
                authAccountRequest.account(),
                authAccountRequest.bank());

        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    @PatchMapping("/main")
    public ResponseEntity<JSONResponse<String>> changeMainAccount(
            HttpServletRequest request,
            @RequestBody ChangeMainAccountRequest changeMainAccountRequest
    ) {
        Member member = authUtil.getMemberFromToken(request);

        walletService.changeMainAccount(member, changeMainAccountRequest.account());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.MAIN_ACCOUNT_SET_SUCCESS));
    }

    @GetMapping("/account")
    public ResponseEntity<JSONResponse<GetAccountResponse>> getAccount(
            HttpServletRequest request
    ) {
        Member member = authUtil.getMemberFromToken(request);

        GetAccountResponse response = walletService.getAccount(member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.GET_ACCOUNT_LIST_SUCCESS, response));
    }

    @GetMapping
    public ResponseEntity<JSONResponse<GetBalanceResponse>> getBalance(
            HttpServletRequest request
    ) {
        Member member = authUtil.getMemberFromToken(request);

        GetBalanceResponse response = walletService.getBalance(member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.GET_WALLET_BALANCE_SUCCESS, response));
    }

    @PostMapping("/deposit")
    public ResponseEntity<JSONResponse<DepositWalletResponse>> deposit(
            HttpServletRequest request,
            @RequestBody DepositWalletRequest depositWalletRequest
    ) {
        Member member = authUtil.getMemberFromToken(request);

        DepositWalletResponse response = walletService.deposit(
                member,
                depositWalletRequest.account(),
                depositWalletRequest.amount());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.CHARGE_WALLET_SUCCESS, response));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<JSONResponse<WithdrawWalletResponse>> withdraw(
            HttpServletRequest request,
            @RequestBody WithdrawWalletRequest withdrawWalletRequest
    ) {
        Member member = authUtil.getMemberFromToken(request);

        WithdrawWalletResponse response = walletService.withdraw(
                member,
                withdrawWalletRequest.account(),
                withdrawWalletRequest.amount());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.EXCHANGE_WALLET_SUCCESS, response));
    }

    @PostMapping("/transfer")
    public ResponseEntity<JSONResponse<TransferWalletResponse>> transfer(
            HttpServletRequest request,
            @RequestBody TransferWalletRequest transferWalletRequest
    ) {
        Member member = authUtil.getMemberFromToken(request);

        TransferWalletResponse response = walletService.transferWallet(
                member,
                transferWalletRequest.memberId(),
                transferWalletRequest.amount());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEND_WALLET_SUCCESS, response));
    }
}
