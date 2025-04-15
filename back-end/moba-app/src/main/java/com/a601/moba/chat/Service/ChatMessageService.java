package com.a601.moba.chat.Service;

import com.a601.moba.chat.Entity.ChatMessage;
import com.a601.moba.chat.Repository.ChatMessageRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;

    public ChatMessage save(ChatMessage message) {
        // sentAt이 비어 있으면 현재 시각으로 설정
        if (message.sentAt() == null) {
            message = ChatMessage.builder()
                    .id(null)
                    .appointmentId(message.appointmentId())
                    .senderId(message.senderId())
                    .senderName(message.senderName())
                    .message(message.message())
                    .sentAt(LocalDateTime.now())
                    .build();
        }

        return chatMessageRepository.save(message);
    }
}