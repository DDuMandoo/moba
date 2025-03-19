package com.a601.moba.auth.Controller.Request;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
}
