package com.a601.moba.wallet.Service;

import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.wallet.Controller.Response.ConnectAccountResponse;
import com.a601.moba.wallet.Entity.Wallet;
import com.a601.moba.wallet.Entity.WalletAccount;
import com.a601.moba.wallet.Exception.WalletAuthException;
import com.a601.moba.wallet.Repository.WalletAccountRepository;
import com.a601.moba.wallet.Repository.WalletRepository;
import jakarta.transaction.Transactional;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletAccountRepository walletAccountRepository;
    private final WalletRepository walletRepository;
    private final WalletRedisService walletRedisService;

    @Value("${moba.bank.base.url}")
    private String BANK_URL;
    @Value("${moba.bank.accesstoken}")
    private String MOBA_ACCESS_TOKEN;

    @Transactional
    public void create(Member member) {
        walletRepository.save(Wallet.builder()
                .member(member)
                .build());
    }

    @Transactional
    public void connectAccount(Member member, String account, String bank) {
        RestTemplate restTemplate = new RestTemplate();

        Random random = new Random();
        String code = String.valueOf(1000 + random.nextInt(9000));

        // 계좌 인증 요청을 위한 데이터 생성
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("accessToken", MOBA_ACCESS_TOKEN);
        requestData.put("bank", bank);
        requestData.put("amount", 1L);
        requestData.put("name", code);
        requestData.put("target", account);

        // 1원 송금 요청
        ResponseEntity<String> response = restTemplate.postForEntity(
                BANK_URL + "/transfer", requestData, String.class
        );

        // 송금 실패
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("🔴 1원 송금 실패");
            throw new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT);
        }

        log.info("🟢 " + response.getBody());

        // 인증 코드 저장
        walletRedisService.saveCode(member.getEmail(), code);
    }

    public ConnectAccountResponse authAccount(Member member, String code, String account, String bank) {
        if (!code.equals(walletRedisService.getCode(member.getEmail()))) {
            throw new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT_CODE);
        }

        RestTemplate restTemplate = new RestTemplate();

        // 계좌 인증 요청을 위한 데이터 생성
        Map<String, String> requestData = new HashMap<>();
        requestData.put("account", account);
        requestData.put("bank", bank);

        // 은행 계좌 인증 API 호출
        ResponseEntity<JSONResponse> response = restTemplate.postForEntity(
                BANK_URL + "/valid", requestData, JSONResponse.class
        );
        // 계좌 인증 실패
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("🔴 계좌 인증 실패");
            throw new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT);
        }

        Map<String, String> result = (Map<String, String>) response.getBody().result();

        Wallet wallet = walletRepository.getByMember(member)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_WALLET));

        walletAccountRepository.save(WalletAccount.builder()
                .account(account)
                .bankType(bank)
                .wallet(wallet)
                .token(result.get("accessToken"))
                .build());

        log.info("🟢 {}님 계좌 연결 성공", member.getName());
        walletRedisService.deleteCode(member.getEmail());

        return ConnectAccountResponse.builder()
                .accessToken(result.get("accessToken"))
                .build();
    }

    public void changeMainAccount(Member member, String account) {
        Wallet wallet = walletRepository.getByMember(member)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_WALLET));
        WalletAccount walletAccount = walletAccountRepository.getWalletAccountByWalletAndIsMainTrue(wallet)
                .orElse(null);

        if (walletAccount != null) {
            walletAccount.toggleMain();
        }

        WalletAccount newMainAccount = walletAccountRepository.getWalletAccountByAccount(account)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT));

        newMainAccount.toggleMain();
    }
}
