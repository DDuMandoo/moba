package com.a601.moba.member.Controller.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberResponse {
    private Long memberId;
    private String email;
    private String name;
    private String image;
}
