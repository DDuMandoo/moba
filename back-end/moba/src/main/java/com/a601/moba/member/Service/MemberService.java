package com.a601.moba.member.Service;

import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.service.S3Service;
import com.a601.moba.member.Controller.Request.MemberUpdateRequest;
import com.a601.moba.member.Controller.Response.MemberUpdateResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
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
    private final MemberRepository memberRepository;

    @Transactional
    public MemberUpdateResponse updateMemberInfo(MemberUpdateRequest request) {
        Member member = authUtil.getCurrentMember();
        Member updateMember = memberRepository.findByEmail(member.getEmail())
                .orElseThrow(() -> new AuthException(ErrorCode.MEMBER_NOT_FOUND));

        if (request.name() != null && !request.name().isBlank()) {
            updateMember.updateName(request.name());
        }

        if (request.password() != null && !request.password().isBlank()) {
            String encoded = passwordEncoder.encode(request.password());
            updateMember.changePassword(encoded);
        }

        if (request.image() != null && !request.image().isEmpty()) {
            String imageUrl = uploadImage(request.image());
            updateMember.updateProfileImage(imageUrl);
        }

        return MemberUpdateResponse.builder()
                .memberId(updateMember.getId())
                .name(updateMember.getName())
                .image(updateMember.getProfileImage())
                .build();
    }


    @Transactional
    public void deleteMember() {
        Member member = authUtil.getCurrentMember();

        if (member.isDeleted()) {
            throw new AuthException(ErrorCode.ALREADY_DELETED_MEMBER);
        }

        member.delete();
    }

    public boolean authenticatePassword(String rawPassword) {
        if (rawPassword == null || rawPassword.isBlank()) {
            return false;
        }

        Member member = authUtil.getCurrentMember();
        String encodedPassword = member.getPassword();

        return passwordEncoder.matches(rawPassword, encodedPassword);
    }


    public String uploadImage(MultipartFile image) {
        return s3Service.uploadFile(image);
    }
}
