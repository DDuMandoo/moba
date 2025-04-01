package com.a601.moba.appointment.Repository;

import com.a601.moba.appointment.Entity.Place;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlaceRepository extends JpaRepository<Place, Integer> {

    @Query("""
                SELECT p FROM Place p
                WHERE LOWER(p.companyName) LIKE %:keyword%
                  AND (:cursorId IS NULL OR p.companyCode > :cursorId)
                ORDER BY p.companyCode ASC
            """)
    List<Place> searchByNameWithCursor(
            @Param("keyword") String keyword,
            @Param("cursorId") Integer cursorId,
            Pageable pageable
    );
}