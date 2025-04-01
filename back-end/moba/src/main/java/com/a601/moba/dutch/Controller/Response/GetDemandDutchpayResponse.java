package com.a601.moba.dutch.Controller.Response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Builder;

@Builder
public record GetDemandDutchpayResponse(
        Integer dutchpayId,
        Integer appointmentId,
        String appointmentName,
        String appointmentImage,
        Long totalPrice,
        Long settled,
        List<Participant> participants,
        boolean isCompleted,
        LocalDateTime time
) {
    @Builder
    public record Participant(
            Integer memberId,
            String memberName,
            String memberImage,
            Long price,
            boolean status
    ) {
    }
}
