package com.a601.moba.member.Controller.Request;

import lombok.Builder;

@Builder
public record MemberUpdateRequest(
        String name,
        String password
) {
}
