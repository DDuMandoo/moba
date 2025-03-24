package com.a601.moba.auth.Controller;

import com.a601.moba.auth.Controller.Request.AuthRequest;
import com.a601.moba.auth.Controller.Request.SignupRequest;
import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Service.AuthService;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthUtil authUtil;

    @PostMapping("/signup")
    public ResponseEntity<JSONResponse<SignupResponse>> signup(@ModelAttribute SignupRequest request) {
        SignupResponse response = authService.signup(
                request.getEmail(),
                request.getPassword(),
                request.getName(),
                request.getImage()
        );
        return ResponseEntity.status(201).body(JSONResponse.onSuccess(response));
    }


    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody AuthRequest request) {
        AuthResponse response = authService.signin(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/kakao/callback")
    public void kakaoCallback(@RequestParam String code, HttpServletResponse response) throws IOException {
        try {
            AuthResponse auth = authService.kakaoSignin(code);

            String encodedAccess = URLEncoder.encode(auth.getAccessToken(), StandardCharsets.UTF_8);
            String encodedRefresh = URLEncoder.encode(auth.getRefreshToken(), StandardCharsets.UTF_8);

            //expo 딥링크
            String frontendUrl = "mobaapp://oauth" +
                    "?access=" + encodedAccess +
                    "&refresh=" + encodedRefresh;

            System.out.println("▶️ 백엔드 redirect URL: " + frontendUrl);
            response.sendRedirect(frontendUrl);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "소셜 로그인 실패");
        }
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

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.LOGOUT_SUCCESS));
    }

    @PostMapping("/reissuance")
    public ResponseEntity<JSONResponse<AuthResponse>> refreshAccessToken(
            @RequestHeader("Authorization") String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        } else {
            throw new AuthException(ErrorCode.INVALID_REFRESH_TOKEN);
        }

        // Access Token 재발급
        AuthResponse response = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }
}
