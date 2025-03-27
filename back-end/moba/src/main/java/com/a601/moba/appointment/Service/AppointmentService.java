// 패키지: com.a601.moba.appointment.Service
package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Controller.Request.AppointmentCreateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentJoinRequest;
import com.a601.moba.appointment.Controller.Response.AppointmentCreateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse.ParticipantInfo;
import com.a601.moba.appointment.Controller.Response.AppointmentJoinResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Entity.AppointmentParticipant.Role;
import com.a601.moba.appointment.Entity.AppointmentParticipant.State;
import com.a601.moba.appointment.Exception.AppointmentException;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.appointment.Util.InviteCodeGenerator;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.service.S3Service;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentParticipantRepository appointmentParticipantRepository;
    private final InviteCodeGenerator inviteCodeGenerator;
    private final S3Service s3Service;
    private final AuthUtil authUtil;
    private final MemberRepository memberRepository;

    public AppointmentCreateResponse createAppointment(AppointmentCreateRequest request, MultipartFile image,
                                                       HttpServletRequest httpRequest) {
        String inviteCode = inviteCodeGenerator.generate()
                .orElseThrow(() -> new AppointmentException(ErrorCode.INVITE_CODE_GENERATION_FAILED));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            try {
                imageUrl = s3Service.uploadFile(image);
            } catch (Exception e) {
                throw new AppointmentException(ErrorCode.APPOINTMENT_IMAGE_UPLOAD_FAILED);
            }
        }

        Appointment appointment = Appointment.builder()
                .name(request.name())
                .image(imageUrl)
                .time(request.time())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .memo(request.memo())
                .inviteUrl(inviteCode)
                .isEnded(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        try {
            appointmentRepository.saveAndFlush(appointment);
        } catch (Exception e) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_SAVE_FAILED);
        }

        Integer appointmentId = appointment.getId();
        Integer hostMemberId = authUtil.getMemberFromToken(httpRequest).getId();

        AppointmentParticipant hostParticipant = AppointmentParticipant.builder()
                .appointment(appointment)
                .memberId(hostMemberId)
                .role(Role.HOST)
                .state(State.JOINED)
                .joinAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        try {
            appointmentParticipantRepository.save(hostParticipant);
        } catch (Exception e) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_SAVE_FAILED);
        }

        return new AppointmentCreateResponse(
                appointmentId,
                appointment.getName(),
                appointment.getImage(),
                appointment.getTime(),
                appointment.getLatitude(),
                appointment.getLongitude(),
                appointment.getMemo(),
                appointment.getInviteUrl(),
                appointment.getIsEnded(),
                appointment.getCreatedAt()
        );
    }

    public AppointmentJoinResponse joinAppointment(AppointmentJoinRequest request, HttpServletRequest httpRequest) {
        Integer memberId = authUtil.getMemberFromToken(httpRequest).getId();

        Appointment appointment = appointmentRepository.findById(request.appointmentId().longValue())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // 기존 참여자 존재 여부 확인
        Optional<AppointmentParticipant> existingParticipantOpt =
                appointmentParticipantRepository.findByAppointmentAndMemberId(appointment, memberId);

        AppointmentParticipant participant;

        if (existingParticipantOpt.isPresent()) {
            AppointmentParticipant existingParticipant = existingParticipantOpt.get();

            switch (existingParticipant.getState()) {
                case JOINED -> throw new AppointmentException(ErrorCode.APPOINTMENT_ALREADY_JOINED);
                case KICKED -> throw new AppointmentException(ErrorCode.APPOINTMENT_JOIN_FORBIDDEN);
                case LEAVE -> {
                    // 다시 참여 허용 (state만 갱신)
                    existingParticipant.updateState(State.JOINED, LocalDateTime.now());
                    participant = appointmentParticipantRepository.save(existingParticipant);
                }
                default -> throw new AppointmentException(ErrorCode.INVALID_REQUEST);
            }
        } else {
            // 신규 참여자 등록
            participant = AppointmentParticipant.builder()
                    .appointment(appointment)
                    .memberId(memberId)
                    .role(Role.PARTICIPANT)
                    .state(State.JOINED)
                    .joinAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            appointmentParticipantRepository.save(participant);
        }

        Member member = memberRepository.findById(memberId.longValue())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        return new AppointmentJoinResponse(
                appointment.getId(),
                appointment.getName(),
                new AppointmentJoinResponse.ParticipantInfo(
                        memberId,
                        member.getName(),
                        participant.getJoinAt()
                )
        );
    }

    public AppointmentDetailResponse getAppointmentDetail(Long appointmentId, HttpServletRequest request) {
        Integer memberId = authUtil.getMemberFromToken(request).getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        // 본인이 JOINED 상태의 참여자인지 확인
        AppointmentParticipant self = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, memberId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (self.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        // 모든 참여자 중 state가 JOINED인 사람만 조회
        List<AppointmentParticipant> participantList = appointmentParticipantRepository
                .findAllByAppointment(appointment).stream()
                .filter(p -> p.getState() == State.JOINED)
                .toList();

        List<ParticipantInfo> participants = participantList.stream()
                .map(p -> {
                    Member member = memberRepository.findById(p.getMemberId().longValue())
                            .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));
                    return new AppointmentDetailResponse.ParticipantInfo(
                            member.getId(),
                            member.getName()
                    );
                })
                .toList();

        return new AppointmentDetailResponse(
                appointment.getId().longValue(),
                appointment.getName(),
                appointment.getImage(),
                appointment.getTime(),
                appointment.getLatitude(),
                appointment.getLongitude(),
                appointment.getMemo(),
                appointment.getIsEnded(),
                participants,
                appointment.getCreatedAt()
        );
    }


    public void leaveAppointment(Long appointmentId, HttpServletRequest request) {
        Integer memberId = authUtil.getMemberFromToken(request).getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, memberId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        if (participant.getRole() == Role.HOST) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_EXIT_FORBIDDEN);
        }

        participant.updateState(State.LEAVE, LocalDateTime.now());
        appointmentParticipantRepository.save(participant);
    }
}
