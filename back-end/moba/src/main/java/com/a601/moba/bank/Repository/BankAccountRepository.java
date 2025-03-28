package com.a601.moba.bank.Repository;


import com.a601.moba.bank.Entity.BankAccount;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Repository;

@Repository
public interface BankAccountRepository extends JpaRepository<BankAccount, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<BankAccount> findByIdAndIsDeletedFalse(String id);
}
