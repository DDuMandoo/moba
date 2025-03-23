package com.a601.moba.member.Controller.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
public class MemberUpdateRequest {
    private String name;
    private String password;
    private MultipartFile image;
}
