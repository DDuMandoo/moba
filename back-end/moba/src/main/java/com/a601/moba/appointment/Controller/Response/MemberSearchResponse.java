package com.a601.moba.appointment.Controller.Response;

import java.util.List;
import lombok.Builder;

public record MemberSearchResponse(
        List<MemberInfo> members,
        Integer cursorId
) {
    @Builder
    public record MemberInfo(
            Integer memberId,
            String name,
            String email,
            String profileImage
    ) {
    }
}
