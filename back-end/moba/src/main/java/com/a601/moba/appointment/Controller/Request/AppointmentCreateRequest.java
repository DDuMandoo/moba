package com.a601.moba.appointment.Controller.Request;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;
import org.springframework.web.multipart.MultipartFile;

@Builder
public record AppointmentCreateRequest(
        String name,
        MultipartFile image,
        LocalDateTime time,
        Double latitude,
        Double longitude,
        String memo,
        List<Integer> friends
) {
}