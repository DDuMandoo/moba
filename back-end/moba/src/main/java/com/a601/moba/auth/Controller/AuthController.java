package com.a601.moba.auth.Controller;

import com.a601.moba.auth.Controller.Request.AuthRequest;
import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(
            @RequestPart("email") String email,
            @RequestPart("password") String password,
            @RequestPart("name") String name,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        SignupResponse response = authService.registerUser(email, password, name, image);
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }
}
