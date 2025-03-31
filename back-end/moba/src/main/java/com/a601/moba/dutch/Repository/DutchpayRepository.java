package com.a601.moba.dutch.Repository;

import com.a601.moba.dutch.Entity.Dutchpay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DutchpayRepository extends JpaRepository<Dutchpay, Integer> {
}
