package com.a601.moba.member.Controller.Response;

import lombok.Builder;

@Builder
public record MemberUpdateResponse(
        Integer memberId,
        String name,
        String image
) {
}
