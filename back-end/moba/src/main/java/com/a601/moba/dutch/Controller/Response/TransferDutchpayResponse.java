package com.a601.moba.dutch.Controller.Response;

import lombok.Builder;

@Builder
public record TransferDutchpayResponse(
        Integer appointmentId,
        String appointmentName,
        String appointmentImage,
        Integer hostId,
        String hostName,
        String hostImage,
        boolean isCompleted // 전체 정산 완료 여부
) {
}
