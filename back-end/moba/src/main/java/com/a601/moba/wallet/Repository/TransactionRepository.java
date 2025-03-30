package com.a601.moba.wallet.Repository;

import com.a601.moba.wallet.Entity.Transaction;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface TransactionRepository extends JpaRepository<Transaction, Integer> {
    @Query("""
                SELECT COALESCE(SUM(t.amount), 0)
                FROM Transaction t
                WHERE t.wallet.id = :walletId
                  AND t.type = 'D'
                  AND t.status = 'COMPLETED'
                  AND (:year IS NULL OR YEAR(t.payAt) = :year)
                  AND (:month IS NULL OR MONTH(t.payAt) = :month)
            """)
    Long sumSpentFromTransactions(Integer walletId, Integer year, Integer month);

    @Query("""
                SELECT t FROM Transaction t
                WHERE t.wallet.id = :walletId 
                AND t.status = 'COMPLETED' 
                AND (:cursorPayAt IS NULL OR t.payAt < :cursorPayAt 
                    OR (t.payAt = :cursorPayAt AND t.id < :cursorId))
                ORDER BY t.payAt DESC, t.id DESC
            """)
    List<Transaction> findTransactions(@Param("walletId") Integer walletId,
                                       @Param("cursorPayAt") LocalDateTime cursorPayAt,
                                       @Param("cursorId") Integer cursorId,
                                       Pageable pageable);

    @Query("""
                SELECT t FROM Transaction t
                WHERE t.wallet.id = :walletId 
                AND t.status = 'COMPLETED' 
                AND t.type = 'D'
                AND (:cursorPayAt IS NULL OR t.payAt < :cursorPayAt 
                    OR (t.payAt = :cursorPayAt AND t.id < :cursorId))
                ORDER BY t.payAt DESC, t.id DESC
            """)
    List<Transaction> findDepositTransactions(@Param("walletId") Integer walletId,
                                              @Param("cursorPayAt") LocalDateTime cursorPayAt,
                                              @Param("cursorId") Integer cursorId,
                                              Pageable pageable);

    @Query("""
                SELECT t FROM Transaction t
                WHERE t.wallet.id = :walletId 
                AND t.status = 'COMPLETED'
                AND t.type = 'W'
                AND (:cursorPayAt IS NULL OR t.payAt < :cursorPayAt 
                    OR (t.payAt = :cursorPayAt AND t.id < :cursorId))
                ORDER BY t.payAt DESC, t.id DESC
            """)
    List<Transaction> findWithdrawTransactions(@Param("walletId") Integer walletId,
                                               @Param("cursorPayAt") LocalDateTime cursorPayAt,
                                               @Param("cursorId") Integer cursorId,
                                               Pageable pageable);

}
