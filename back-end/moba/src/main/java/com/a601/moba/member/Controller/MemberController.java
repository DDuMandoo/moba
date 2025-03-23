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
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
public class MemberController {

    private final AuthUtil authUtil;
    private final AuthService authService;
    private final MemberService memberService;

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

    @PatchMapping("/update")
    public ResponseEntity<JSONResponse<MemberUpdateResponse>> updateMemberInfo(
            @ModelAttribute MemberUpdateRequest request,
            HttpServletRequest servletRequest
    ) {
        MemberUpdateResponse response = memberService.updateMemberInfo(request, servletRequest);
        return ResponseEntity.ok(JSONResponse.onSuccess(response));
    }


    @PostMapping("/password/reset")
    public ResponseEntity<JSONResponse<Void>> resetPassword(@RequestBody PasswordResetRequest request) {
        authService.resetPassword(request.getEmail());
        return ResponseEntity
                .status(SuccessCode.PASSWORD_RESET_SUCCESS.getHttpStatus())
                .body(JSONResponse.of(SuccessCode.PASSWORD_RESET_SUCCESS));
    }


}
