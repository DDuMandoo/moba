package com.a601.moba.auth.Controller;

import com.a601.moba.auth.Controller.Request.AuthRequest;
import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Service.AuthService;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthUtil authUtil;

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

    @PostMapping("/signout")
    public ResponseEntity<JSONResponse<String>> signout(HttpServletRequest request) {
        // 현재 로그인한 사용자의 Access Token
        String accessToken = authUtil.getAccessToken(request);
        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.status(401).body(JSONResponse.onFailure(ErrorCode.UNAUTHORIZED_ACCESS));
        }

        // Access Token을 기반으로 로그아웃 수행
        authService.signout(accessToken);

        // SuccessCode에서 메시지를 가져와서 반환
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.LOGOUT_SUCCESS));
    }

    @PostMapping("/reissuance")
    public ResponseEntity<JSONResponse<AuthResponse>> refreshAccessToken(@RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        } else {
            throw new AuthException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // ✅ Access Token 재발급
        AuthResponse response = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

}
