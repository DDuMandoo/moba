package com.a601.moba.member.Service;

import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Controller.Request.MemberUpdateRequest;
import com.a601.moba.member.Controller.Response.MemberUpdateResponse;
import com.a601.moba.member.Entity.Member;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class MemberService {

    private final AuthUtil authUtil;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public MemberUpdateResponse updateMemberInfo(MemberUpdateRequest request, HttpServletRequest servletRequest) {
        Member member = authUtil.getMemberFromToken(servletRequest);

        if (request.getName() != null && !request.getName().isBlank()) {
            member.updateName(request.getName());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            String encoded = passwordEncoder.encode(request.getPassword());
            member.setPassword(encoded);
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            String imageUrl = uploadImage(request.getImage());
            member.updateProfileImage(imageUrl);
        }

        return new MemberUpdateResponse(
                member.getId(),
                member.getName(),
                member.getProfileImage()
        );
    }

    @Transactional
    public void deleteMember(HttpServletRequest request) {
        Member member = authUtil.getMemberFromToken(request);

        if (member.isDeleted()) {
            throw new AuthException(ErrorCode.ALREADY_DELETED_MEMBER);
        }

        member.delete();
    }


    // 실제 S3 또는 로컬 이미지 업로드 구현에 따라 변경 가능
    public String uploadImage(MultipartFile image) {
        // 임시 구현 - 실제 구현에서는 S3 또는 로컬 경로 처리
        return null;
    }
}
