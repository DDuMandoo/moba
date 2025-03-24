package com.a601.moba.auth.Controller.Response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SignupResponse {
    private Integer memberId;
    private String email;
    private String name;
    private String image;
}
