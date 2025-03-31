package com.a601.moba.member.Controller.Request;

import lombok.Builder;
import org.springframework.web.multipart.MultipartFile;

@Builder
public record MemberUpdateRequest(
        String name,
        String password,
        MultipartFile image
) {
}
