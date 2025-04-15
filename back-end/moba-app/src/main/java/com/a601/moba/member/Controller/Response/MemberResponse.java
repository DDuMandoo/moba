package com.a601.moba.member.Controller.Response;

import lombok.Builder;

@Builder
public record MemberResponse(
        Integer memberId,
        String email,
        String name,
        String image
) {
}
