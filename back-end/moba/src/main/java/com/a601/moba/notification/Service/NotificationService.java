package com.a601.moba.notification.Service;

import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.Controller.Request.NotificationRequest;
import com.a601.moba.notification.Controller.Response.NotificationResponse;
import com.a601.moba.notification.Entity.Notification;
import com.a601.moba.notification.Repository.NotificationRepository;
import com.google.firebase.messaging.FirebaseMessagingException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FcmTokenService fcmTokenService;

    public Notification saveNotification(Member sender, Member receiver, NotificationRequest dto)
            throws FirebaseMessagingException {
        Notification.Type type = Notification.Type.valueOf(String.valueOf(dto.type()));

        Notification notification = Notification.builder()
                .sender(sender)
                .receiver(receiver)
                .content(dto.body())
                .type(type)
                .deepLink(dto.deepLink())
                .isRead(false)
                .build();

        fcmTokenService.send(dto, receiver);
        return notificationRepository.save(notification);
    }

    public List<NotificationResponse> getUnreadNotifications(Member receiver) {
        return notificationRepository.findByReceiverAndIsReadFalseOrderByCreatedAtDesc(receiver)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public void marAsRead(Integer notificationId, Member receiver) {
        Optional<Notification> optional = notificationRepository.findByIdAndReceiver(notificationId, receiver);

        if (optional.isPresent()) {
            Notification notification = optional.get();

            if (!notification.getIsRead()) {
                notification.markAsRead();
                notificationRepository.save(notification);
            }
        }
    }

    
}
