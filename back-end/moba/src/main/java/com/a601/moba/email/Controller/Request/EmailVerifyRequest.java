package com.a601.moba.email.Controller.Request;

import lombok.Getter;

@Getter
public class EmailVerifyRequest {
    private String email;
    private String code;
}