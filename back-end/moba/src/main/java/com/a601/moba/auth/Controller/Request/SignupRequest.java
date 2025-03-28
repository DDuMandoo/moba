package com.a601.moba.auth.Controller.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class SignupRequest {
    private String email;
    private String password;
    private String name;
}
