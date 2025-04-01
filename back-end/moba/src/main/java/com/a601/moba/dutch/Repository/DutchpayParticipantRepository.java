package com.a601.moba.dutch.Repository;

import com.a601.moba.dutch.Entity.DutchpayParticipant;
import com.a601.moba.dutch.Entity.DutchpayParticipantId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DutchpayParticipantRepository extends JpaRepository<DutchpayParticipant, DutchpayParticipantId> {
}
