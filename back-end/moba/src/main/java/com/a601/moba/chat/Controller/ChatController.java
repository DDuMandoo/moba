package com.a601.moba.chat.Controller;

import com.a601.moba.chat.Entity.ChatMessage;
import com.a601.moba.chat.Service.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat.send")
    public void receiveMessage(ChatMessage message) {
        ChatMessage saved = chatMessageService.save(message); // 저장
        messagingTemplate.convertAndSend("/topic/chat." + saved.appointmentId(), saved); // 저장된 메시지 전송
    }
}