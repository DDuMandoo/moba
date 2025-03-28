package com.a601.moba.wallet.Controller;

import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.wallet.Controller.Request.AuthAccountRequest;
import com.a601.moba.wallet.Controller.Request.ChangeMainAccountRequest;
import com.a601.moba.wallet.Controller.Request.ConnectAccountRequest;
import com.a601.moba.wallet.Controller.Response.ConnectAccountResponse;
import com.a601.moba.wallet.Service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
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

}
