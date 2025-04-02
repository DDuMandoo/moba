package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Entity.Appointment;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {
    @Query("""
                SELECT a FROM Appointment a
                JOIN AppointmentParticipant ap ON ap.appointment = a
                WHERE ap.member.id = :memberId
                  AND ap.state = 'JOINED'
                  AND (:keyword IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
                  AND (:cursorId IS NULL OR a.id < :cursorId)
                ORDER BY a.id DESC
            """)
    List<Appointment> findByNameContainingAndParticipantWithCursor(
            @Param("memberId") Integer memberId,
            @Param("keyword") String keyword,
            @Param("cursorId") Integer cursorId,
            Pageable pageable);

    @Query("SELECT DISTINCT a FROM AppointmentParticipant ap " +
            "JOIN ap.appointment a " +
            "JOIN Member m ON ap.member.id = m.id " +
            "WHERE (LOWER(m.name) LIKE %:keyword% OR LOWER(m.email) LIKE %:keyword%) " +
            "AND (:cursorId IS NULL OR a.id > :cursorId) " +
            "ORDER BY a.id ASC")
    List<Appointment> findByMemberKeyword(@Param("keyword") String keyword,
                                          @Param("cursorId") Integer cursorId,
                                          Pageable pageable);

}