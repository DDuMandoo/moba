package com.a601.moba.bank.Service;

import com.a601.moba.bank.Controller.Response.CreateBankResponse;
import com.a601.moba.bank.Controller.Response.ValidBankResponse;
import com.a601.moba.bank.Entity.Bank;
import com.a601.moba.bank.Entity.BankAccount;
import com.a601.moba.bank.Entity.BankTransaction;
import com.a601.moba.bank.Entity.TransactionType;
import com.a601.moba.bank.Exception.BankException;
import com.a601.moba.bank.Repository.BankAccountRepository;
import com.a601.moba.bank.Repository.BankRepository;
import com.a601.moba.bank.Repository.BankTransactionRepository;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.util.JwtUtil;
import jakarta.transaction.Transactional;
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
    PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public CreateBankResponse createAccount(Integer bankId, String name, String password) {
        Bank bank = bankRepository.findById(bankId)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_BANK_ID));

        boolean flag = true;
        String account = null;
        while(flag){
            account = generateAccountNumber();
            flag = bankAccountRepository.existsById(account);
        }

        String encodedPassword = passwordEncoder.encode(password);

        System.out.println(bankAccountRepository.save(
                BankAccount.builder()
                        .bank(bank)
                        .id(account)
                        .name(name)
                        .password(encodedPassword)
                .build()));

        // 임시 토큰 생성
        String accesstoken = jwtUtil.generateAccessToken(account, bank.getName());

        log.info("🟢 계좌 생성 성공");

        return CreateBankResponse.builder()
                .account(account)
                .accessToken(accesstoken)
                .build();
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
    public void transfer(String accessToken, String targetId, Long amount, String name) {
        if(!jwtUtil.isTokenValid(accessToken)){
            throw new BankException(ErrorCode.INVALID_BANK_TOKEN);
        }

        String accountId = jwtUtil.getAccountFromToken(accessToken);
        if(accountId.equals(targetId)){
            throw new BankException(ErrorCode.TRANSFER_ACCOUNT_DUPLICATE);
        }

        BankAccount account = bankAccountRepository.findByIdAndIsDeletedFalse(accountId)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_ACCOUNT_ID));

        BankAccount target = bankAccountRepository.findByIdAndIsDeletedFalse(targetId)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_ACCOUNT_ID));

        //출금
        account.withdraw(amount);

        bankTransactionRepository.save(
                BankTransaction.builder()
                        .account(account)
                        .amount(amount)
                        .target(target)
                        .type(TransactionType.WITHDRAW)
                        .build()
        );

        log.info("🟢 출금 성공");

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
    }

    @Transactional
    public ValidBankResponse valid(String account, String bank) {
        BankAccount bankAccount = bankAccountRepository.findByIdAndIsDeletedFalse(account)
                .orElseThrow(() -> new BankException(ErrorCode.INVALID_BANK_ID));

        if(!bankAccount.getBank().getName().equals(bank)){
            throw new BankException(ErrorCode.INVALID_BANK_NAME);
        }

        String accessToken = jwtUtil.generateAccessToken(account, bank);
        String refreshToken = jwtUtil.generateRefreshToken(account, bank);

        bankAccount.updateRefreshToken(refreshToken);
        return ValidBankResponse.builder()
                .accessToken(accessToken)
                .build();
    }
}
