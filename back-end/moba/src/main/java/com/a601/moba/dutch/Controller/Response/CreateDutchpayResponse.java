package com.a601.moba.dutch.Controller.Response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record CreateDutchpayResponse(
        Integer dutchpayId,
        Integer appointmentId,
        String appointmentName,
        Integer hostId,
        String hostName,
        String hostImage,
        Long totalPrice,
        LocalDateTime createdAt,
        List<Participant> participants
) {
    @Builder
    public record Participant(
            Integer memberId,
            String memberName,
            String memberImage,
            boolean status,
            Long price
    ) {
    }
}
