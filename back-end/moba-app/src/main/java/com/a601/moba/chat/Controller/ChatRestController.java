package com.a601.moba.chat.Controller;

import com.a601.moba.chat.Entity.ChatMessage;
import com.a601.moba.chat.Repository.ChatMessageRepository;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatRestController {

    private final ChatMessageRepository chatMessageRepository;

    @GetMapping("/{appointmentId}")
    public List<ChatMessage> getChatMessages(
            @PathVariable Integer appointmentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "sentAt"));

        // Mongo에서도 Page 반환
        Page<ChatMessage> pageResult = chatMessageRepository.findByAppointmentId(appointmentId, pageable);

        return pageResult.getContent()
                .stream()
                .sorted(Comparator.comparing(ChatMessage::sentAt)) // 최신순 정렬 후 오래된 순으로 보기 위해 다시 정렬
                .toList();
    }


}