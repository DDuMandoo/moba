package com.a601.moba.member.Controller.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberUpdateResponse {
    private Long memberId;
    private String name;
    private String image;
}
