package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentImage;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentImageRepository extends JpaRepository<AppointmentImage, Integer> {

    @Query("""
                SELECT ai FROM AppointmentImage ai
                WHERE ai.appointment = :appointment
                AND (:cursorId IS NULL OR ai.id < :cursorId)
                ORDER BY ai.id DESC
            """)
    List<AppointmentImage> findByAppointmentWithCursor(@Param("appointment") Appointment appointment,
                                                       @Param("cursorId") Integer cursorId,
                                                       Pageable pageable);
}
