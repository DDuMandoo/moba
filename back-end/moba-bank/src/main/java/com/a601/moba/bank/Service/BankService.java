package com.a601.moba.bank.Service;

import com.a601.moba.bank.Controller.Response.CreateBankResponse;
import com.a601.moba.bank.Controller.Response.GetAccountResponse;
import com.a601.moba.bank.Controller.Response.GetReceiptResponse;
import com.a601.moba.bank.Controller.Response.GetTransactionResponse;
import com.a601.moba.bank.Controller.Response.SearchTransactionResponse;
import com.a601.moba.bank.Controller.Response.TransferBankResponse;
import com.a601.moba.bank.Controller.Response.ValidBankResponse;
import com.a601.moba.bank.Entity.Bank;
import com.a601.moba.bank.Entity.BankAccount;
import com.a601.moba.bank.Entity.BankTransaction;
import com.a601.moba.bank.Entity.CardTransaction;
import com.a601.moba.bank.Entity.TransactionType;
import com.a601.moba.bank.Exception.BankException;
import com.a601.moba.bank.Repository.BankAccountRepository;
import com.a601.moba.bank.Repository.BankRepository;
import com.a601.moba.bank.Repository.BankTransactionRepository;
import com.a601.moba.bank.Repository.CardTransactionRepository;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.util.JwtUtil;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Objects;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankService {

    private final BankRepository bankRepository;
    private final BankAccountRepository bankAccountRepository;
    private final JwtUtil jwtUtil;
    private final BankTransactionRepository bankTransactionRepository;
    private final CardTransactionRepository cardTransactionRepository;
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public CreateBankResponse createAccount(Integer bankId, Integer uniqueId, String name, String password) {
        Bank bank = bankRepository.findById(bankId)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_BANK_ID));

        boolean flag = true;
        String account = null;
        while(flag){
            account = generateAccountNumber();
            flag = bankAccountRepository.existsById(account);
        }

        String encodedPassword = passwordEncoder.encode(password);

        bankAccountRepository.save(
                BankAccount.builder()
                        .bank(bank)
                        .uniqueId(uniqueId)
                        .id(account)
                        .name(name)
                        .password(encodedPassword)
                .build());

        // 임시 토큰 생성
        String accessToken = jwtUtil.generateAccessToken(uniqueId, account);

        log.info("🟢 계좌 생성 성공");

        return CreateBankResponse.builder()
                .account(account)
                .accessToken(accessToken)
                .build();
    }

    public List<GetAccountResponse> getAccount(Integer uniqueId) {
        List<BankAccount> accounts = bankAccountRepository.findAllByUniqueIdAndIsDeletedFalse(uniqueId);

        return  accounts.stream().map(
                (a) -> {
                    return GetAccountResponse.builder()
                            .uniqueId(a.getUniqueId())
                            .account(a.getId())
                            .bankName(a.getBank().getName())
                            .name(a.getName())
                            .balance(a.getBalance())
                            .build();
                    }
            ).toList();
    }

    public List<GetTransactionResponse> getTransaction(String account, String password) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndIsDeletedFalse(account)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_ACCOUNT_ID));

        if(!passwordEncoder.matches(password, bankAccount.getPassword())){
            throw new BankException(ErrorCode.INVALID_ACCOUNT_PASSWORD);
        }

        List<BankTransaction> transactions = bankTransactionRepository.findAllByAccount(bankAccount);

        return transactions.stream().map(
                (t) -> {
                    return GetTransactionResponse.builder()
                            .targetName(t.getTarget().getName())
                            .name(t.getName())
                            .type(t.getType())
                            .amount(t.getAmount())
                            .time(t.getTransactionAt())
                            .build();
                }
        ).toList();
    }

    // 계좌번호 생성 로직
    private String generateAccountNumber() {
        Random random = new Random();
        StringBuilder accountNumber = new StringBuilder();
        for (int i = 0; i < 13; i++) {
            if(i == 3 || i == 9) {
                accountNumber.append("-");
                continue;
            }
            accountNumber.append(random.nextInt(10)); // 0-9 사이의 랜덤 숫자
        }
        return accountNumber.toString();
    }

    @Transactional
    public TransferBankResponse transfer(String accessToken, String targetId, Long amount, String name) {
        if(!jwtUtil.isTokenValid(accessToken)){
            throw new BankException(ErrorCode.INVALID_BANK_TOKEN);
        }

        String accountId = jwtUtil.getAccountFromToken(accessToken);
        if(accountId.equals(targetId)){
            throw new BankException(ErrorCode.TRANSFER_ACCOUNT_DUPLICATE);
        }

        BankAccount account = bankAccountRepository.findByIdAndIsDeletedFalseForUpdate(accountId)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_ACCOUNT_ID));

        BankAccount target = bankAccountRepository.findByIdAndIsDeletedFalseForUpdate(targetId)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_ACCOUNT_ID));

        //출금
        account.withdraw(amount);

        BankTransaction withdrawTransaction = bankTransactionRepository.save(
                BankTransaction.builder()
                        .account(account)
                        .amount(amount)
                        .target(target)
                        .type(TransactionType.WITHDRAW)
                        .build()
        );

        log.info("🟢 출금 성공");

        if(!name.isEmpty()){
            withdrawTransaction.updateName(target.getName());
            log.info("🟢 입금자명 변경");
        }

        // 입금
        target.deposit(amount);

        BankTransaction depositTransaction = bankTransactionRepository.save(
                BankTransaction.builder()
                        .account(target)
                        .amount(amount)
                        .target(account)
                        .type(TransactionType.DEPOSIT)
                        .build()
        );

        log.info("🟢 입금 성공");

        if(!name.isEmpty()){
            depositTransaction.updateName(name);
            log.info("🟢 입금자명 변경");
        }

        return TransferBankResponse.builder()
                .depositId(depositTransaction.getId())
                .withdrawId(withdrawTransaction.getId())
                .build();
    }

    @Transactional
    public ValidBankResponse valid(Integer uniqueId, String account, String bank) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndIsDeletedFalseForUpdate(account)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_BANK_ID));

        if(!Objects.equals(bankAccount.getUniqueId(), uniqueId)){
            throw new BankException(ErrorCode.INVALID_UNIQUE_ID);
        }

        String accessToken = jwtUtil.generateAccessToken(uniqueId, account);
        String refreshToken = jwtUtil.generateRefreshToken(uniqueId, account);

        bankAccount.updateRefreshToken(refreshToken);
        return ValidBankResponse.builder()
                .accessToken(accessToken)
                .build();
    }

    public SearchTransactionResponse searchTransaction(Integer id, String accessToken) {
        if(!jwtUtil.isTokenValid(accessToken)){
            throw new BankException(ErrorCode.INVALID_BANK_TOKEN);
        }
        BankTransaction transaction = bankTransactionRepository.getBankTransactionById(id)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_TRANSACTION_ID));

        return SearchTransactionResponse.builder()
                .amount(transaction.getAmount())
                .targetId(transaction.getTarget().getId())
                .build();
    }

    @Transactional
    public List<GetReceiptResponse> getReceipt(Integer uniqueId) {
        List<CardTransaction> transactions = cardTransactionRepository.findAllByUniqueId(uniqueId);

        return transactions.stream().map(this::mapToReceiptResponse).toList();
    }

    public GetReceiptResponse mapToReceiptResponse(CardTransaction transaction){
        return GetReceiptResponse.builder()
                .receiptId(transaction.getId())
                .placeId(transaction.getPlace().getId())
                .placeName(transaction.getPlace().getName())
                .category(transaction.getPlace().getCategory())
                .subCategory(transaction.getPlace().getSubCategory())
                .amount(transaction.getAmount())
                .payedAt(transaction.getPayedAt())
                .build();
    }
}
