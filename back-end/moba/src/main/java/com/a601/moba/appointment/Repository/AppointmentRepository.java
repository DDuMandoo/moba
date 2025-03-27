package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

}