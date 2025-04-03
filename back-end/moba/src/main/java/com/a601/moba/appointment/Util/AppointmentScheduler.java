package com.a601.moba.appointment.Util;

import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.appointment.Service.LocationWebSocketService;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@EnableScheduling
public class AppointmentScheduler {

    private final AppointmentRepository appointmentRepository;
    private final LocationWebSocketService webSocketService;
    private final AppointmentParticipantRepository appointmentParticipantRepository;

    @Transactional
//    @Scheduled(fixedRate = 60000) // 1분마다 실행
    public void checkUpcomingAppointments() {
        log.info("10분 이내 약속 위치 요청");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tenMinutesLater = now.plusMinutes(10);

        // 약속 시간이 10분 이내인 약속 찾기
        List<Appointment> upcomingAppointments = appointmentRepository.findByTimeBetweenAndIsEndedFalse(now,
                tenMinutesLater);

        for (Appointment appointment : upcomingAppointments) {
            List<AppointmentParticipant> participants = appointmentParticipantRepository.findAllByAppointment(
                    appointment);

            // 참가자들에게 위치 요청
            for (AppointmentParticipant participant : participants) {
                webSocketService.requestLocation(participant.getMember().getEmail());
            }
        }
    }
}