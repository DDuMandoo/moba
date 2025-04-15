package com.a601.moba.dutch.Controller.Request;

import java.util.List;
import lombok.Builder;

@Builder
public record CreateDutchpayRequest(
        Integer appointmentId,
        Long totalPrice,
        List<Participant> participants
) {
    @Builder
    public record Participant(
            Integer memberId,
            Long price
    ) {
    }
}
