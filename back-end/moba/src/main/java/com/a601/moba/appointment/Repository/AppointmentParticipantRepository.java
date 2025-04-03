package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AppointmentParticipantRepository extends JpaRepository<AppointmentParticipant, Integer> {
    List<AppointmentParticipant> findAllByAppointment(Appointment appointment);

    Optional<AppointmentParticipant> findByAppointmentAndMemberId(Appointment appointment, Integer memberId);

    List<AppointmentParticipant> findAllByMemberIdAndState(Integer memberId, State state);

    List<AppointmentParticipant> findByMemberIdIn(List<Integer> memberIds);

    List<AppointmentParticipant> findByAppointmentIdIn(List<Integer> appointmentIds);

    List<AppointmentParticipant> findByAppointmentAndState(Appointment appointment, State state);

    @Query("""
                SELECT COUNT(DISTINCT ap.appointment.id)
                FROM AppointmentParticipant ap
                WHERE ap.memberId = :memberId
                  AND ap.state = 'JOINED'
                  AND (:year IS NULL OR YEAR(ap.appointment.time) = :year)
                  AND (:month IS NULL OR MONTH(ap.appointment.time) = :month)
            """)
    int countJoinedAppointmentsByMemberAndDate(Integer memberId, Integer year, Integer month);

    boolean existsByAppointmentAndMemberIdAndState(Appointment appointment, Integer id, State state);
}