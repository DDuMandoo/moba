package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Entity.Appointment;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    @Query("""
                SELECT DISTINCT a FROM Appointment a
                WHERE (:keyword IS NULL OR LOWER(a.name) LIKE %:keyword%)
                AND (:cursorId IS NULL OR a.id > :cursorId)
                ORDER BY a.id ASC
            """)
    List<Appointment> findByNameWithCursor(
            @Param("keyword") String keyword,
            @Param("cursorId") Integer cursorId,
            Pageable pageable
    );

}