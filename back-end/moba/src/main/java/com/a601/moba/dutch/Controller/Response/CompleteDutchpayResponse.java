package com.a601.moba.dutch.Controller.Response;

import lombok.Builder;

@Builder
public record CompleteDutchpayResponse(
        Integer MemberId,
        String MemberName,
        String MemberImage,
        boolean isCompleted // 전체 정산 완료 여부
) {
}
