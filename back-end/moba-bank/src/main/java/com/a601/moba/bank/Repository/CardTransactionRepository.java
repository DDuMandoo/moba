package com.a601.moba.bank.Repository;

import com.a601.moba.bank.Entity.CardTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CardTransactionRepository extends JpaRepository<CardTransaction, Integer> {
    List<CardTransaction> findAllByUniqueId(Integer uniqueId);
}
