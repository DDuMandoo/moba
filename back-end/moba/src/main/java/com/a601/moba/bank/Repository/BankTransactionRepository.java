package com.a601.moba.bank.Repository;

import com.a601.moba.bank.Entity.BankTransaction;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BankTransactionRepository extends JpaRepository<BankTransaction, Integer> {
    Optional<BankTransaction> getBankTransactionById(Integer id);
}
