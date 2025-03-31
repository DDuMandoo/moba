package com.a601.moba.auth.Controller;

import com.a601.moba.auth.Controller.Request.AuthRequest;
import com.a601.moba.auth.Controller.Request.EmailDuplicateCheckRequest;
import com.a601.moba.auth.Controller.Request.SignupRequest;
import com.a601.moba.auth.Controller.Response.AuthResponse;
import com.a601.moba.auth.Controller.Response.SignupResponse;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Service.AuthService;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "인증", description = "회원가입 / 로그인 / 소셜 로그인 / 토큰 재발급 API")
public class AuthController {

    private final AuthService authService;
    private final AuthUtil authUtil;

    @Operation(summary = "회원가입", description = "이메일, 비밀번호, 이름으로 회원가입을 수행합니다.")
    @PostMapping("/signup")
    public ResponseEntity<JSONResponse<SignupResponse>> signup(
            @RequestBody SignupRequest request
    ) {
        SignupResponse response = authService.signup(
                request.email(),
                request.password(),
                request.name()
        );
        return ResponseEntity.status(201).body(JSONResponse.onSuccess(response));
    }

    @Operation(summary = "프로필 이미지 업로드", description = "회원가입 후 프로필 이미지를 업로드합니다.")
    @PostMapping(value = "/{memberId}/profile-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JSONResponse<Void>> uploadProfileImage(
            @PathVariable Integer memberId,
            @RequestParam("image") MultipartFile image
    ) {
        authService.uploadProfileImage(memberId, image);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.PROFILE_IMAGE_UPLOAD_SUCCESS));
    }


    @Operation(summary = "일반 로그인", description = "이메일과 비밀번호로 로그인을 수행합니다.")
    @PostMapping("/signin")
    public ResponseEntity<JSONResponse<AuthResponse>> signin(@RequestBody AuthRequest request) {
        AuthResponse response = authService.signin(request.email(), request.password());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SIGNIN_SUCCESS, response));
    }

    @Operation(summary = "카카오 로그인 콜백", description = "카카오 소셜 로그인 인가 코드를 처리하고 앱으로 딥링크 리다이렉트합니다.")
    @GetMapping("/kakao/callback")
    public void kakaoCallback(@RequestParam String code, HttpServletResponse response) throws IOException {
        try {
            AuthResponse auth = authService.kakaoSignin(code);

            String encodedAccess = URLEncoder.encode(auth.accessToken(), StandardCharsets.UTF_8);
            String encodedRefresh = URLEncoder.encode(auth.refreshToken(), StandardCharsets.UTF_8);

            String frontendUrl = "mobaapp://oauth" +
                    "?access=" + encodedAccess +
                    "&refresh=" + encodedRefresh;

            log.info("@@@@ 백엔드 redirect URL: {}", frontendUrl);
            response.sendRedirect(frontendUrl);
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "소셜 로그인 실패");
        }
    }

    //프론트엔드에서 카카오 코드 받고 호출
//    @PostMapping("/social/kakao")
//    public ResponseEntity<JSONResponse<AuthResponse>> kakaoLogin(@RequestBody Map<String, String> body) {
//        String code = body.get("code");
//        AuthResponse tokens = authService.kakaoSignin(code);
//        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SIGNIN_SUCCESS, tokens));
//    }

    @Operation(summary = "로그아웃", description = "현재 로그인한 사용자의 Access Token을 무효화하여 로그아웃 처리합니다.")
    @PostMapping("/signout")
    public ResponseEntity<JSONResponse<String>> signout(HttpServletRequest request) {
        // 현재 로그인한 사용자의 Access Token
        String accessToken = authUtil.getAccessToken(request);
        if (accessToken == null || accessToken.isEmpty()) {
            return ResponseEntity.status(401).body(JSONResponse.onFailure(ErrorCode.UNAUTHORIZED_ACCESS));
        }

        // Access Token을 기반으로 로그아웃 수행
        authService.signout(accessToken);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SIGNOUT_SUCCESS));
    }

    @Operation(summary = "Access Token 재발급", description = "Refresh Token을 사용하여 새로운 Access Token을 발급받습니다.")
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

    @Operation(summary = "이메일 중복 확인", description = "회원가입 시 이메일이 이미 존재하는지 확인합니다.")
    @PostMapping("/email")
    public ResponseEntity<JSONResponse<Boolean>> checkEmailDuplicate(@RequestBody EmailDuplicateCheckRequest request) {
        boolean isDuplicated = authService.isEmailDuplicated(request.email());
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, isDuplicated));
    }

    
}
