package com.a601.moba.wallet.Repository;

import com.a601.moba.wallet.Entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
}
