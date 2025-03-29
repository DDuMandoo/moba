package com.a601.moba.member.Service;

import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.service.S3Service;
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
    private final S3Service s3Service;

    @Transactional
    public MemberUpdateResponse updateMemberInfo(MemberUpdateRequest request, HttpServletRequest servletRequest) {
        Member member = authUtil.getMemberFromToken(servletRequest);

        if (request.name() != null && !request.name().isBlank()) {
            member.updateName(request.name());
        }

        if (request.password() != null && !request.password().isBlank()) {
            String encoded = passwordEncoder.encode(request.password());
            member.changePassword(encoded);
        }

        if (request.image() != null && !request.image().isEmpty()) {
            String imageUrl = uploadImage(request.image());
            member.updateProfileImage(imageUrl);
        }

        return MemberUpdateResponse.builder()
                .memberId(member.getId())
                .name(member.getName())
                .image(member.getProfileImage())
                .build();
    }


    @Transactional
    public void deleteMember(HttpServletRequest request) {
        Member member = authUtil.getMemberFromToken(request);

        if (member.isDeleted()) {
            throw new AuthException(ErrorCode.ALREADY_DELETED_MEMBER);
        }

        member.delete();
    }

    public String uploadImage(MultipartFile image) {
        return s3Service.uploadFile(image);
    }
}
