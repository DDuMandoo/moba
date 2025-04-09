package com.a601.moba.notification.scheduler;

import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.notification.Service.NotificationService;
import com.a601.moba.notification.exception.SendAppointmentException;
import com.google.firebase.messaging.FirebaseMessagingException;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AppointmentReminderScheduler {

    private final AppointmentRepository appointmentRepository;
    private final MemberRepository memberRepository;
    private final AppointmentParticipantRepository appointmentParticipantRepository;
    private final NotificationService notificationService;

    @Scheduled(cron = "0 * * * * *", zone = "Asia/Seoul")
    public void sendReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime targetTime = now.plusMinutes(10);

        LocalDateTime from = targetTime.minusSeconds(30);
        LocalDateTime to = targetTime.plusSeconds(30);
        List<Appointment> appointments = appointmentRepository.findByTimeBetweenAndIsEndedFalseAndReminderSentFalse(
                from, to);
        for (Appointment appointment : appointments) {
            try {
                List<AppointmentParticipant> participants = appointmentParticipantRepository.findByAppointmentAndState(
                        appointment, State.JOINED);
                for (AppointmentParticipant participant : participants) {
                    try {
                        Member member = participant.getMember();
                        notificationService.sendReminder(member, member,
                                appointment.getId(),
                                appointment.getName());
                    } catch (FirebaseMessagingException e) {
                        throw new SendAppointmentException(ErrorCode.FCM_TOKEN_SEND_APPOINTMENT);
                    }

                }
            } catch (Exception e) {
                log.error("약속 푸시 알림 실패 - appointmentId: {}, error: {}", appointment.getId(), e.getMessage(), e);
                throw new SendAppointmentException(ErrorCode.FCM_TOKEN_SEND_APPOINTMENT_MYSERVER);
            }
        }
    }
}
