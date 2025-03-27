package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Constant.Role;
import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Controller.Request.AppointmentCreateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentJoinRequest;
import com.a601.moba.appointment.Controller.Response.AppointmentCreateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse.ParticipantInfo;
import com.a601.moba.appointment.Controller.Response.AppointmentJoinResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
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
import jakarta.transaction.Transactional;
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

    public AppointmentCreateResponse create(AppointmentCreateRequest request, MultipartFile image,
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
                .build();

        appointmentRepository.saveAndFlush(appointment);

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

        appointmentParticipantRepository.save(hostParticipant);

        return AppointmentCreateResponse.builder()
                .appointmentId(appointmentId)
                .name(appointment.getName())
                .imageUrl(appointment.getImage())
                .time(appointment.getTime())
                .latitude(appointment.getLatitude())
                .longitude(appointment.getLongitude())
                .memo(appointment.getMemo())
                .inviteCode(appointment.getInviteUrl())
                .isEnded(appointment.getIsEnded())
                .build();

    }

    @Transactional
    public AppointmentJoinResponse join(AppointmentJoinRequest request, HttpServletRequest httpRequest) {
        Integer memberId = authUtil.getMemberFromToken(httpRequest).getId();

        Appointment appointment = appointmentRepository.findById(request.appointmentId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        Optional<AppointmentParticipant> existingParticipantOpt =
                appointmentParticipantRepository.findByAppointmentAndMemberId(appointment, memberId);

        AppointmentParticipant participant;

        if (existingParticipantOpt.isPresent()) {
            AppointmentParticipant existingParticipant = existingParticipantOpt.get();
            State state = existingParticipant.getState();

            if (state == State.JOINED) {
                throw new AppointmentException(ErrorCode.APPOINTMENT_ALREADY_JOINED);
            }

            if (state == State.KICKED) {
                throw new AppointmentException(ErrorCode.APPOINTMENT_JOIN_FORBIDDEN);
            }

            if (state == State.LEAVE) {
                existingParticipant.updateState(State.JOINED);
                participant = existingParticipant;
            } else {
                throw new AppointmentException(ErrorCode.INVALID_REQUEST);
            }
        } else {
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

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        return AppointmentJoinResponse.builder()
                .appointmentId(appointment.getId())
                .name(appointment.getName())
                .participant(AppointmentJoinResponse.ParticipantInfo.builder()
                        .memberId(memberId)
                        .name(member.getName())
                        .joinedAt(participant.getJoinAt())
                        .build())
                .build();
    }


    public AppointmentDetailResponse getDetail(Integer appointmentId, HttpServletRequest request) {
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

        // JOINED 상태의 참여자만 필터링
        List<AppointmentParticipant> participantList = appointmentParticipantRepository
                .findAllByAppointment(appointment).stream()
                .filter(p -> p.getState() == State.JOINED)
                .toList();

        List<ParticipantInfo> participants = participantList.stream()
                .map(p -> {
                    Member member = memberRepository.findById(p.getMemberId())
                            .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));
                    return ParticipantInfo.builder()
                            .memberId(member.getId())
                            .name(member.getName())
                            .build();
                })
                .toList();

        return AppointmentDetailResponse.builder()
                .appointmentId(appointment.getId())
                .name(appointment.getName())
                .imageUrl(appointment.getImage())
                .time(appointment.getTime())
                .latitude(appointment.getLatitude())
                .longitude(appointment.getLongitude())
                .memo(appointment.getMemo())
                .isEnded(appointment.getIsEnded())
                .participants(participants)
                .build();
    }


    @Transactional
    public void leave(Integer appointmentId, HttpServletRequest request) {
        Integer memberId = authUtil.getMemberFromToken(request).getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, memberId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        if (participant.getRole() == Role.HOST) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_EXIT_FORBIDDEN);
        }

        participant.updateState(State.LEAVE);
    }

}
