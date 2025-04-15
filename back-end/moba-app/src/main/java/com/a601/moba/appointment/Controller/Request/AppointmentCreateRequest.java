package com.a601.moba.appointment.Controller.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record AppointmentCreateRequest(
        @Schema(description = "약속 이름", example = "점심 모임")
        String name,

        @Schema(description = "약속 시간", example = "2025-04-01T12:00:00")
        LocalDateTime time,

        @Schema(description = "장소 ID", example = "1")
        Integer placeId,

        @Schema(description = "메모", example = "점심 약속 장소는 시청 근처")
        String memo,

        @Schema(description = "초대한 친구 ID 목록", example = "[1, 2, 3]")
        List<Integer> friends
) {
}