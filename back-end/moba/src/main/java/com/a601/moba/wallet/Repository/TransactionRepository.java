package com.a601.moba.wallet.Repository;

import com.a601.moba.wallet.Entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    @Query("""
                SELECT COALESCE(SUM(t.amount), 0)
                FROM Transaction t
                WHERE t.wallet.id = :walletId
                  AND t.type = 'W'
                  AND t.status = 'COMPLETED'
                  AND (:year IS NULL OR YEAR(t.payAt) = :year)
                  AND (:month IS NULL OR MONTH(t.payAt) = :month)
            """)
    Long sumSpentFromTransactions(Integer walletId, Integer year, Integer month);
}
