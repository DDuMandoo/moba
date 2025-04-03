package com.a601.moba.notification.Service;

import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.controller.Request.NotificationRequest;
import com.a601.moba.notification.controller.Response.NotificationResponse;
import com.a601.moba.notification.entity.Notification;
import com.a601.moba.notification.entity.Notification.Type;
import com.a601.moba.notification.repository.NotificationRepository;
import com.google.firebase.messaging.FirebaseMessagingException;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final FcmTokenService fcmTokenService;

    public void notify(Member sender, Member receiver, NotificationRequest dto) throws FirebaseMessagingException {
        Notification.Type type = Notification.Type.valueOf(String.valueOf(dto.type()));

        Notification notification = Notification.builder()
                .sender(sender)
                .receiver(receiver)
                .content(dto.body())
                .type(type)
                .deepLink(dto.deepLink())
                .isRead(false)
                .build();

        notificationRepository.save(notification);
        fcmTokenService.send(dto, receiver);
    }

    public List<NotificationResponse> getUnreadNotifications(Member receiver) {
        return notificationRepository.findByReceiverAndIsReadFalseOrderByCreatedAtDesc(receiver)
                .stream()
                .map(NotificationResponse::from)
                .toList();
    }

    public void markAsRead(Integer notificationId, Member receiver) {
        Optional<Notification> optional = notificationRepository.findByIdAndReceiver(notificationId, receiver);

        if (optional.isPresent()) {
            Notification notification = optional.get();

            if (!notification.getIsRead()) {
                notification.markAsRead();
                notificationRepository.save(notification);
            }
        }
    }

    public void sendInvite(Member sender, Member receiver, Integer appointmentId) throws FirebaseMessagingException {
        notify(sender, receiver, NotificationRequest.builder()
                .receiverId(receiver.getId())
                .title("약속 초대")
                .body(sender.getName() + "님이 약속에 초대했어요!")
                .type(Type.INVITE)
                .deepLink("/invite/" + appointmentId)
                .build());
    }

    public void sendReminder(Member sender, Member receiver, Integer appointmentId, String appointmentName)
            throws FirebaseMessagingException {
        notify(sender, receiver, NotificationRequest.builder()
                .receiverId(receiver.getId())
                .title(appointmentName + "약속 10분 전!")
                .body("곧 약속 시간이예요.")
                .type(Type.REMINDER)
                .deepLink("/appointments/" + appointmentId)
                .build());
    }

    public void sendSettlementStarted(Member sender, Member receiver, String appointmentTitle, int totalAmount,
                                      int peopleCount, int userAmount,
                                      Long settlementId) throws FirebaseMessagingException {
        String title = appointmentTitle + " 정산을 시작합니다.";
        String body = "참여 인원 : " + peopleCount +
                "\n총 액 : " + totalAmount +
                "\n보내야 될 금액 : " + userAmount;

        NotificationRequest dto = NotificationRequest.builder()
                .receiverId(receiver.getId())
                .title(title)
                .body(body)
                .type(Type.PAY)
                .deepLink("/settlements/" + settlementId)
                .build();

        notify(sender, receiver, dto);
    }

    public void sendSettlementPaid(Member sender, Member receiver, int amount) throws FirebaseMessagingException {
        String title = sender.getName() + "님이 송금하였습니다.";
        String body = "금액 : " + amount;

        NotificationRequest dto = NotificationRequest.builder()
                .receiverId(receiver.getId())
                .title(title)
                .body(body)
                .type(Type.PAY)
                .deepLink("/wallet")
                .build();
        notify(sender, receiver, dto);
    }

    public void sendSettlementCompleted(String appointmentTitle, Member sender, Member receiver, Integer settlementId)
            throws FirebaseMessagingException {
        String title = appointmentTitle + "의 정산이 완료되었습니다.";
        String body = "";

        NotificationRequest dto = NotificationRequest.builder()
                .receiverId(receiver.getId())
                .title(title)
                .body(body)
                .type(Type.PAY)
                .deepLink("/settlements/" + settlementId)
                .build();

        notify(sender, receiver, dto);
    }
}
