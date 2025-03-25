package com.a601.moba.member.Controller.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MemberUpdateResponse {
    private Integer memberId;
    private String name;
    private String image;
}
