package com.a601.moba.member.Controller;

import com.a601.moba.auth.Service.AuthService;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Controller.Request.MemberUpdateRequest;
import com.a601.moba.member.Controller.Request.PasswordResetRequest;
import com.a601.moba.member.Controller.Response.MemberResponse;
import com.a601.moba.member.Controller.Response.MemberUpdateResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@Tag(name = "회원", description = "회원 정보 조회 / 수정 / 탈퇴 / 비밀번호 재설정 API")
public class MemberController {

    private final AuthUtil authUtil;
    private final AuthService authService;
    private final MemberService memberService;

    @Operation(summary = "내 정보 조회", description = "현재 로그인한 회원의 정보를 조회합니다.")
    @GetMapping
    public ResponseEntity<JSONResponse<MemberResponse>> getMyInfo(HttpServletRequest request) {
        Member member = authUtil.getMemberFromToken(request);

        MemberResponse response = new MemberResponse(
                member.getId(),
                member.getEmail(),
                member.getName(),
                member.getProfileImage()
        );

        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    @Operation(summary = "회원 정보 수정", description = "회원 이름 또는 프로필 이미지를 수정합니다.")
    @PatchMapping("/update")
    public ResponseEntity<JSONResponse<MemberUpdateResponse>> updateMemberInfo(
            @ModelAttribute MemberUpdateRequest request,
            HttpServletRequest servletRequest
    ) {
        MemberUpdateResponse response = memberService.updateMemberInfo(request, servletRequest);
        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }

    @Operation(summary = "비밀번호 재설정 메일 전송", description = "비밀번호 재설정 링크가 포함된 이메일을 전송합니다.")
    @PostMapping("/password/reset")
    public ResponseEntity<JSONResponse<Void>> resetPassword(@RequestBody PasswordResetRequest request) {
        authService.resetPassword(request.email());
        return ResponseEntity
                .status(SuccessCode.PASSWORD_RESET_SUCCESS.getHttpStatus())
                .body(JSONResponse.of(SuccessCode.PASSWORD_RESET_SUCCESS));
    }

    @Operation(summary = "회원 탈퇴", description = "현재 로그인한 회원을 탈퇴 처리합니다.")
    @DeleteMapping
    public ResponseEntity<JSONResponse<Void>> deleteMember(HttpServletRequest request) {
        memberService.deleteMember(request);
        return ResponseEntity
                .status(SuccessCode.MEMBER_DELETE_SUCCESS.getHttpStatus())
                .body(JSONResponse.of(SuccessCode.MEMBER_DELETE_SUCCESS));
    }
}
