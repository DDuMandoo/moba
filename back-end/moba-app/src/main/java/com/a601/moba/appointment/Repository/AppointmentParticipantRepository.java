package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.member.Entity.Member;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface AppointmentParticipantRepository extends JpaRepository<AppointmentParticipant, Integer> {
    List<AppointmentParticipant> findAllByAppointment(Appointment appointment);

    Optional<AppointmentParticipant> findByAppointmentAndMember(Appointment appointment, Member member);

    List<AppointmentParticipant> findAllByMemberAndState(Member member, State state);

    List<AppointmentParticipant> findAllByAppointmentId(Integer appointmentId);

    List<AppointmentParticipant> findByMember(Member member);

    List<AppointmentParticipant> findByAppointment(Appointment appointment);

    List<AppointmentParticipant> findByAppointmentAndState(Appointment appointment, State state);

    @Query("""
                SELECT COUNT(DISTINCT ap.appointment.id)
                FROM AppointmentParticipant ap
                WHERE ap.member.id = :memberId
                  AND ap.state = 'JOINED'
                  AND (:year IS NULL OR YEAR(ap.appointment.time) = :year)
                  AND (:month IS NULL OR MONTH(ap.appointment.time) = :month)
            """)
    int countJoinedAppointmentsByMemberAndDate(Integer memberId, Integer year, Integer month);

    boolean existsByAppointmentAndMemberAndState(Appointment appointment, Member member, State state);

    List<AppointmentParticipant> findByAppointmentId(Integer id);

    List<AppointmentParticipant> findAllByAppointmentAndMemberIn(Appointment appointment, List<Member> members);

    Optional<AppointmentParticipant> findByAppointmentAndMemberAndState(Appointment appointment, Member member,
                                                                        State state);

    boolean existsByAppointmentAndMember(Appointment appointment, Member member);
}