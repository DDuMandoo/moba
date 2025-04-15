package com.a601.moba.chat.Repository;

import com.a601.moba.chat.Entity.ChatMessage;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {
    List<ChatMessage> findByAppointmentIdOrderBySentAtAsc(Integer appointmentId);

    Page<ChatMessage> findByAppointmentId(Integer appointmentId, Pageable pageable);

}