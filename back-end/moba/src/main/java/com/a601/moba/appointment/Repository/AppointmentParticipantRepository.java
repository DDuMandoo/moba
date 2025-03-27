package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentParticipantRepository extends JpaRepository<AppointmentParticipant, Integer> {
    List<AppointmentParticipant> findAllByAppointment(Appointment appointment);

    Optional<AppointmentParticipant> findByAppointmentAndMemberId(Appointment appointment, Integer memberId);

}