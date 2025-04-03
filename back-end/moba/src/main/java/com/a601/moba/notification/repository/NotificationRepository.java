package com.a601.moba.notification.repository;

import com.a601.moba.member.Entity.Member;
import com.a601.moba.notification.entity.Notification;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    // 읽지 않은 알림만 조회
    List<Notification> findByReceiverAndIsReadFalseOrderByCreatedAtDesc(Member receiver);

    // 읽음 처리용 (내 알림인지 확인)
    Optional<Notification> findByIdAndReceiver(Integer id, Member receiver);
}
