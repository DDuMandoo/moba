package com.a601.moba.notification.Controller;

import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.Controller.Request.NotificationRequest;
import com.a601.moba.notification.Controller.Response.NotificationResponse;
import com.a601.moba.notification.Entity.Notification.Type;
import com.a601.moba.notification.Service.NotificationService;
import com.google.firebase.messaging.FirebaseMessagingException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthUtil authUtil;

    @PostMapping("/test")
    public ResponseEntity<JSONResponse<Void>> sendTestNotification() throws FirebaseMessagingException {
        Member member = authUtil.getCurrentMember();
        NotificationRequest dto = NotificationRequest.builder().
                receiverId(member.getId())
                .title("테스트 알림입니다.")
                .body("이 알림은 테스트용이다.")
                .type(Type.INVITE)
                .deepLink("/test")
                .build();

        notificationService.saveNotification(member, member, dto);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SUCCESS_FCM_TOKEN_TEST));
    }

    @GetMapping("/unread")
    public ResponseEntity<JSONResponse<List<NotificationResponse>>> getUnreadNotifications() {
        Member member = authUtil.getCurrentMember();
        List<NotificationResponse> notifications = notificationService.getUnreadNotifications(member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.GET_NOTIFICATION_LIST, notifications));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<JSONResponse<Void>> markAsRead(@PathVariable Integer id) {
        Member member = authUtil.getCurrentMember();
        notificationService.marAsRead(id, member);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.READ_NOTIFICATION));
    }
}
