package com.a601.moba.wallet.Service;

import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.notification.Service.NotificationService;
import com.a601.moba.wallet.Controller.Response.ConnectAccountResponse;
import com.a601.moba.wallet.Controller.Response.DepositWalletResponse;
import com.a601.moba.wallet.Controller.Response.GetAccountResponse;
import com.a601.moba.wallet.Controller.Response.GetBalanceResponse;
import com.a601.moba.wallet.Controller.Response.GetTransactionResponse;
import com.a601.moba.wallet.Controller.Response.TransferWalletResponse;
import com.a601.moba.wallet.Controller.Response.WithdrawWalletResponse;
import com.a601.moba.wallet.Entity.Transaction;
import com.a601.moba.wallet.Entity.TransactionStatus;
import com.a601.moba.wallet.Entity.TransactionType;
import com.a601.moba.wallet.Entity.Wallet;
import com.a601.moba.wallet.Entity.WalletAccount;
import com.a601.moba.wallet.Exception.WalletAuthException;
import com.a601.moba.wallet.Repository.TransactionRepository;
import com.a601.moba.wallet.Repository.WalletAccountRepository;
import com.a601.moba.wallet.Repository.WalletRepository;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletAccountRepository walletAccountRepository;
    private final WalletRepository walletRepository;
    private final WalletRedisService walletRedisService;
    private final TransactionRepository transactionRepository;
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthUtil authUtil;
    private final NotificationService notificationService;

    @Value("${moba.bank.base.url}")
    private String BANK_URL;
    @Value("${moba.bank.accesstoken}")
    private String MOBA_ACCESS_TOKEN;
    @Value("${moba.bank.account}")
    private String MOBA_ACCOUNT;

    @Transactional
    public void create(Member member) {
        walletRepository.save(Wallet.builder()
                .member(member)
                .build());
    }

    public Wallet getWallet(Member member) {
        return walletRepository.getByMember(member)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_WALLET));
    }

    public Wallet getWalletForUpdate(Member member) {
        return walletRepository.getByMemberForUpdate(member)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_WALLET));
    }

    @Transactional
    public void connectAccount(String account, String bank) {
        Member member = authUtil.getCurrentMember();
        if (walletAccountRepository.existsByAccount(account)) {
            throw new WalletAuthException(ErrorCode.DUPLICATE_CONNECT_ACCOUNT);
        }

        Random random = new Random();
        String code = String.valueOf(1000 + random.nextInt(9000));

        // 1원 송금
        ResponseEntity<JSONResponse> response = transfer(MOBA_ACCESS_TOKEN,
                bank,
                1L,
                code,
                account);

        // 송금 실패
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("🔴 1원 송금 실패");
            throw new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT);
        }

        log.info("🟢 " + response.getBody().result());

        // 인증 코드 저장
        walletRedisService.saveCode(member.getEmail(), code);
    }

    @Transactional
    public ConnectAccountResponse authAccount(String code, String account, String bank) {
        Member member = authUtil.getCurrentMember();
        if (!code.equals(walletRedisService.getCode(member.getEmail()))) {
            throw new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT_CODE);
        }

        RestTemplate restTemplate = new RestTemplate();

        // 계좌 인증 요청을 위한 데이터 생성
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("uniqueId", member.getId());
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

        Wallet wallet = getWallet(member);

        walletAccountRepository.save(WalletAccount.builder()
                .account(account)
                .bank(bank)
                .wallet(wallet)
                .token(result.get("accessToken"))
                .build());

        log.info("🟢 {}님 계좌 연결 성공", member.getName());
        walletRedisService.deleteCode(member.getEmail());

        return ConnectAccountResponse.builder()
                .accessToken(result.get("accessToken"))
                .build();
    }

    @Transactional
    public void changeMainAccount(String account) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);
        WalletAccount walletAccount = walletAccountRepository.getWalletAccountByWalletAndIsMainTrue(wallet)
                .orElse(null);

        if (walletAccount != null) {
            walletAccount.toggleMain();
        }

        WalletAccount newMainAccount = walletAccountRepository.getWalletAccountByAccountAndWallet(account, wallet)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT));

        newMainAccount.toggleMain();
    }

    @Transactional
    public GetAccountResponse getAccount() {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);

        List<WalletAccount> accounts = walletAccountRepository.getAllByWallet(wallet);

        List<GetAccountResponse.Account> accountResponses = accounts.stream()
                .map(account -> new GetAccountResponse.Account(
                        account.getAccount(),
                        account.getBank(),
                        account.isMain(),
                        account.getCreatedAt()
                ))
                .collect(Collectors.toList());

        return new GetAccountResponse(accountResponses);

    }

    @Transactional
    public GetBalanceResponse getBalance() {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);

        return GetBalanceResponse.builder()
                .balance(wallet.getBalance())
                .build();
    }

    @Transactional
    public DepositWalletResponse deposit(String account, Long amount) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);
        WalletAccount walletAccount = walletAccountRepository.getWalletAccountByAccount(account)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT));

        // 사용자 계좌 -> moba 계좌
        ResponseEntity<JSONResponse> response = transfer(walletAccount.getToken(),
                walletAccount.getBank(),
                amount,
                member.getName(),
                MOBA_ACCOUNT);

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("🔴 지갑 충전 실패");
            throw new WalletAuthException(ErrorCode.FAIL_CHARGE_ACCOUNT);
        }

        Transaction transaction = transactionRepository.save(Transaction.builder()
                .wallet(wallet)
                .target(wallet)
                .amount(amount)
                .status(TransactionStatus.PENDING)
                .type(TransactionType.D)
                .build());

        Map<String, Integer> result = (Map<String, Integer>) response.getBody().result();

        // 입금 확인 로직
        if (checkTransaction(result.get("depositId"), amount, walletAccount.getAccount())) {
            log.info("🟢 입금 확인");
            transaction.updateStatus(TransactionStatus.COMPLETED);
        } else {
            log.error("🔴 입금 확인 실패");
            transfer(MOBA_ACCESS_TOKEN,
                    "모바은행",
                    amount,
                    "충전실패환급",
                    account);
            transaction.updateStatus(TransactionStatus.FAILED);
            throw new WalletAuthException(ErrorCode.FAIL_CHARGE_ACCOUNT);
        }

        log.info("🟢 지갑 충전 완료");
        wallet.deposit(amount);

        return DepositWalletResponse.builder()
                .account(account)
                .bank(walletAccount.getBank())
                .amount(amount)
                .time(transaction.getPayAt())
                .build();
    }

    @Transactional
    public WithdrawWalletResponse withdraw(String account, Long amount) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);
        WalletAccount walletAccount = walletAccountRepository.getWalletAccountByAccount(account)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_VERIFICATION_ACCOUNT));
        // moba -> 사용자 계좌
        ResponseEntity<JSONResponse> response = transfer(MOBA_ACCESS_TOKEN,
                "모바은행",
                amount,
                "MOBA",
                account);
        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            log.error("🔴 계좌 환전 실패");
            throw new WalletAuthException(ErrorCode.FAIL_CHARGE_ACCOUNT);
        }

        Transaction transaction = transactionRepository.save(Transaction.builder()
                .wallet(wallet)
                .target(wallet)
                .amount(amount)
                .status(TransactionStatus.PENDING)
                .type(TransactionType.W)
                .build());

        Map<String, Integer> result = (Map<String, Integer>) response.getBody().result();

        // 검증 로직 매서드
        if (checkTransaction(result.get("withdrawId"), amount, walletAccount.getAccount())) {
            log.info("🟢 출금 확인");
            transaction.updateStatus(TransactionStatus.COMPLETED);
        } else {
            log.error("🔴 출금 확인 실패");
            transfer(walletAccount.getToken(),
                    walletAccount.getBank(),
                    amount,
                    "환전실패",
                    MOBA_ACCOUNT);
            transaction.updateStatus(TransactionStatus.FAILED);
            throw new WalletAuthException(ErrorCode.FAIL_CHARGE_ACCOUNT);
        }

        log.info("🟢 계좌 환전 완료");
        wallet.withdraw(amount);

        return WithdrawWalletResponse.builder()
                .account(account)
                .bank(walletAccount.getBank())
                .amount(amount)
                .time(transaction.getPayAt())
                .build();
    }

    //bank 이체
    @Transactional
    public ResponseEntity<JSONResponse> transfer(String accessToken, String bank, Long amount, String name,
                                                 String target) {
        RestTemplate restTemplate = new RestTemplate();

        // moba -> 사용자 계좌
        Map<String, Object> requestData = new HashMap<>();
        requestData.put("accessToken", accessToken);
        requestData.put("bank", bank);
        requestData.put("amount", amount);
        requestData.put("name", name);
        requestData.put("target", target);

        ResponseEntity<JSONResponse> response = restTemplate.postForEntity(
                BANK_URL + "/transfer", requestData, JSONResponse.class
        );

        return response;
    }


    private boolean checkTransaction(Integer id, Long amount, String targetId) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> requestData = new HashMap<>();
        requestData.put("accessToken", MOBA_ACCESS_TOKEN);
        requestData.put("id", id);

        ResponseEntity<JSONResponse> response = restTemplate.postForEntity(
                BANK_URL + "/search", requestData, JSONResponse.class
        );
        Map<String, Object> result = (Map<String, Object>) response.getBody().result();

        Long amountFromResult = ((Number) result.get("amount")).longValue();

        return amountFromResult.equals(amount) && result.get("targetId")
                .equals(targetId);
    }

    @Transactional
    public TransferWalletResponse transferWallet(Integer targetId, Long amount) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWalletForUpdate(member);

        Member target = memberRepository.getMemberById(targetId)
                .orElseThrow(() -> new AuthException(ErrorCode.MEMBER_NOT_FOUND));

        Wallet targetWallet = getWalletForUpdate(target);

        //출금
        Transaction withdrawTransaction = transactionRepository.save(
                Transaction.builder()
                        .wallet(wallet)
                        .target(targetWallet)
                        .amount(amount)
                        .type(TransactionType.W)
                        .status(TransactionStatus.PENDING)
                        .build()
        );

        // 입금
        Transaction depositTransaction = transactionRepository.save(
                Transaction.builder()
                        .wallet(targetWallet)
                        .amount(amount)
                        .target(wallet)
                        .type(TransactionType.D)
                        .status(TransactionStatus.PENDING)
                        .build()
        );

        try {
            wallet.withdraw(amount); // 출금
            log.info("🟢 출금 성공");

            targetWallet.deposit(amount); // 입금
            log.info("🟢 입금 성공");

            withdrawTransaction.updateStatus(TransactionStatus.COMPLETED);
            depositTransaction.updateStatus(TransactionStatus.COMPLETED);

            notificationService.sendSettlementPaid(wallet.getMember(), targetWallet.getMember(), amount);
        } catch (Exception e) {
            log.error("🔴 이체 실패: {}", e.getMessage());
            throw new RuntimeException(e);
        }

        return TransferWalletResponse.builder()
                .memberId(targetId)
                .name(target.getName())
                .image(target.getProfileImage())
                .amount(amount)
                .time(withdrawTransaction.getPayAt())
                .build();
    }

    public void dutchpayTransfer(Wallet wallet, Wallet targetWallet, Transaction withdrawTransaction,
                                 Transaction depositTransaction,
                                 Long amount) {
        try {
            wallet.withdraw(amount); // 출금
            log.info("🟢 출금 성공");

            targetWallet.deposit(amount); // 입금
            log.info("🟢 입금 성공");

            withdrawTransaction.updateStatus(TransactionStatus.COMPLETED);
            depositTransaction.updateStatus(TransactionStatus.COMPLETED);

            notificationService.sendSettlementPaid(wallet.getMember(), targetWallet.getMember(), amount);
        } catch (Exception e) {
            log.error("🔴 이체 실패: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public void setPassword(String password) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);

        if (password.length() != 6) {
            throw new WalletAuthException(ErrorCode.INVALID_PASSWORD_FORM);
        }
        String encodedPassword = passwordEncoder.encode(password);

        wallet.updatePassword(encodedPassword);
    }

    @Transactional
    public void auth(String password) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);

        if (!passwordEncoder.matches(password, wallet.getPassword())) {
            throw new WalletAuthException(ErrorCode.INVALID_WALLET_PASSWORD);
        }
    }

    public GetTransactionResponse getTransaction(Pageable pageable, Integer cursorId,
                                                 LocalDateTime cursorPayAt) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);

        List<Transaction> transactions = transactionRepository.findTransactions(wallet.getId(), cursorPayAt, cursorId,
                pageable);

        return convertToResponse(transactions);
    }

    public GetTransactionResponse getDepositTransaction(Pageable pageable, Integer cursorId,
                                                        LocalDateTime cursorPayAt) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);

        List<Transaction> transactions = transactionRepository.findDepositTransactions(wallet.getId(), cursorPayAt,
                cursorId, pageable);

        return convertToResponse(transactions);
    }

    public GetTransactionResponse getWithdrawTransaction(Pageable pageable, Integer cursorId,
                                                         LocalDateTime cursorPayAt) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWallet(member);

        List<Transaction> transactions = transactionRepository.findWithdrawTransactions(wallet.getId(), cursorPayAt,
                cursorId,
                pageable);

        return convertToResponse(transactions);
    }

    public GetTransactionResponse convertToResponse(List<Transaction> transactions) {
        Integer nextCursorId = transactions.isEmpty() ? null : transactions.get(transactions.size() - 1).getId();
        LocalDateTime nextCursorPayAt =
                transactions.isEmpty() ? null : transactions.get(transactions.size() - 1).getPayAt();

        List<GetTransactionResponse.transaction> transactionList = transactions.stream()
                .map(t -> {
                    Member target = t.getTarget().getMember();
                    return GetTransactionResponse.transaction.builder()
                            .name(target.getName())
                            .image(target.getProfileImage())
                            .payAt(t.getPayAt())
                            .amount(t.getAmount())
                            .type(t.getType())
                            .build();
                })
                .collect(Collectors.toList());

        return GetTransactionResponse.builder()
                .cursorId(nextCursorId)
                .cursorPayAt(nextCursorPayAt)
                .transactions(transactionList)
                .build();
    }
}
