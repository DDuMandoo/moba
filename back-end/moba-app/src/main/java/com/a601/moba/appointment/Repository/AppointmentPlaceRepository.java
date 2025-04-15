package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentPlace;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppointmentPlaceRepository extends JpaRepository<AppointmentPlace, Integer> {
    Integer countByAppointment(Appointment appointment);

    List<AppointmentPlace> findAllByAppointmentOrderByOrderAsc(Appointment appointment);

    List<AppointmentPlace> findAllByAppointment(Appointment appointment);
}
