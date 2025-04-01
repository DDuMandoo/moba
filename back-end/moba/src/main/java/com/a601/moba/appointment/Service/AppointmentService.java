package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Constant.Role;
import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Controller.Request.AppointmentCreateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentDelegateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentJoinRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentKickRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentUpdateRequest;
import com.a601.moba.appointment.Controller.Response.AppointmentCreateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDelegateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse.ParticipantInfo;
import com.a601.moba.appointment.Controller.Response.AppointmentJoinResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentListItemResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentParticipantResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentSummaryResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentUpdateResponse;
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
import com.a601.moba.wallet.Entity.Wallet;
import com.a601.moba.wallet.Repository.TransactionRepository;
import com.a601.moba.wallet.Repository.WalletRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;

    public AppointmentCreateResponse create(AppointmentCreateRequest request, MultipartFile image) {
        String inviteCode = inviteCodeGenerator.generate()
                .orElseThrow(() -> new AppointmentException(ErrorCode.INVITE_CODE_GENERATION_FAILED));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = s3Service.uploadFile(image);
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
        Integer hostMemberId = authUtil.getCurrentMember().getId();

        AppointmentParticipant hostParticipant = AppointmentParticipant.builder()
                .appointment(appointment)
                .memberId(hostMemberId)
                .role(Role.HOST)
                .state(State.JOINED)
                .joinAt(LocalDateTime.now())
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
                .createdAt(appointment.getCreatedAt())
                .build();
    }

    @Transactional
    public AppointmentJoinResponse join(AppointmentJoinRequest request) {
        Integer memberId = authUtil.getCurrentMember().getId();

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

    public AppointmentDetailResponse getDetail(Integer appointmentId) {
        Integer memberId = authUtil.getCurrentMember().getId();

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
                            .profileImage(member.getProfileImage())
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
                .createdAt(appointment.getCreatedAt())
                .build();
    }


    @Transactional
    public void leave(Integer appointmentId) {
        Integer memberId = authUtil.getCurrentMember().getId();

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

    @Transactional
    public AppointmentUpdateResponse update(Integer appointmentId,
                                            AppointmentUpdateRequest request,
                                            MultipartFile image) {
        Integer memberId = authUtil.getCurrentMember().getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, memberId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (participant.getRole() != Role.HOST || participant.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        String imageUrl = appointment.getImage();
        if (image != null && !image.isEmpty()) {
            imageUrl = s3Service.uploadFile(image);
        }

        appointment.update(
                request.name(),
                imageUrl,
                request.time(),
                request.latitude(),
                request.longitude(),
                request.memo()
        );

        return AppointmentUpdateResponse.builder()
                .appointmentId(appointment.getId())
                .name(appointment.getName())
                .imageUrl(appointment.getImage())
                .time(appointment.getTime())
                .latitude(appointment.getLatitude())
                .longitude(appointment.getLongitude())
                .memo(appointment.getMemo())
                .updatedAt(appointment.getUpdatedAt())
                .build();
    }


    @Transactional
    public void deleteImage(Integer appointmentId) {
        Appointment appointment = validateHostAccess(appointmentId);
        appointment.uploadImage(null);
    }

    @Transactional
    public void end(Integer appointmentId) {
        Appointment appointment = validateHostAccess(appointmentId);
        appointment.end();
    }

    @Transactional(readOnly = true)
    public AppointmentParticipantResponse getParticipants(Integer appointmentId) {
        Integer memberId = authUtil.getCurrentMember().getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, memberId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (participant.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        List<AppointmentParticipant> joinedParticipants = appointmentParticipantRepository
                .findAllByAppointment(appointment).stream()
                .filter(p -> p.getState() == State.JOINED)
                .toList();

        // 참가자의 memberId 리스트 추출
        List<Integer> memberIds = joinedParticipants.stream()
                .map(AppointmentParticipant::getMemberId)
                .distinct()
                .toList();

        // memberId로 회원 정보 일괄 조회 (IN 절). 여기서 쿼리 하나만 나감 -> N+1 문제 해결
        Map<Integer, Member> memberMap = memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getId, member -> member));

        List<AppointmentParticipantResponse.ParticipantInfo> participants = joinedParticipants.stream()
                .map(p -> {
                    Member member = memberMap.get(p.getMemberId());
                    if (member == null) {
                        throw new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND);
                    }
                    return AppointmentParticipantResponse.ParticipantInfo.builder()
                            .memberId(member.getId())
                            .name(member.getName())
                            .profileImage(member.getProfileImage())
                            .build();
                }).toList();

        return AppointmentParticipantResponse.builder()
                .appointmentId(appointment.getId())
                .participants(participants)
                .build();
    }


    @Transactional
    public AppointmentDelegateResponse delegateHost(Integer appointmentId, AppointmentDelegateRequest request) {
        Member currentMember = authUtil.getCurrentMember();
        Appointment appointment = validateHostAccess(appointmentId);

        AppointmentParticipant currentHost = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, currentMember.getId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        AppointmentParticipant newHost = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, request.newHostId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        if (newHost.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.INVALID_REQUEST);
        }

        // 권한 위임
        currentHost.updateRole(Role.PARTICIPANT);
        newHost.updateRole(Role.HOST);

        Member preMember = memberRepository.findById(currentHost.getMemberId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        Member newMember = memberRepository.findById(newHost.getMemberId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        return AppointmentDelegateResponse.builder()
                .preHostId(preMember.getId())
                .preHostName(preMember.getName())
                .newHostId(newMember.getId())
                .newHostName(newMember.getName())
                .build();
    }


    @Transactional
    public void kickParticipant(Integer appointmentId, AppointmentKickRequest request) {
        Appointment appointment = validateHostAccess(appointmentId);

        AppointmentParticipant target = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, request.memberId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        if (target.getRole() == Role.HOST) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_KICK_FORBIDDEN);
        }

        target.updateState(State.KICKED);
    }

    public List<AppointmentListItemResponse> getMyAppointments(Integer year, Integer month) {
        Integer memberId = authUtil.getCurrentMember().getId();

        List<AppointmentParticipant> participants = appointmentParticipantRepository
                .findAllByMemberIdAndState(memberId, State.JOINED);

        return participants.stream()
                .map(AppointmentParticipant::getAppointment)
                .filter(appointment -> {
                    if (year == null || month == null) {
                        return true;
                    }
                    LocalDateTime time = appointment.getTime();
                    return time.getYear() == year && time.getMonthValue() == month;
                })
                .map(appointment -> AppointmentListItemResponse.builder()
                        .appointmentId(appointment.getId())
                        .name(appointment.getName())
                        .imageUrl(appointment.getImage())
                        .time(appointment.getTime())
                        .latitude(appointment.getLatitude())
                        .longitude(appointment.getLongitude())
                        .memo(appointment.getMemo())
                        .isEnded(appointment.getIsEnded())
                        .inviteUrl(appointment.getInviteUrl())
                        .createdAt(appointment.getCreatedAt())
                        .updatedAt(appointment.getUpdatedAt())
                        .deletedAt(appointment.getDeletedAt())
                        .build())
                .toList();
    }


    public AppointmentSummaryResponse getAppointmentSummary(Integer year, Integer month) {
        Member member = authUtil.getCurrentMember();

        Wallet wallet = walletRepository.findByMemberId(member.getId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.INVALID_WALLET));

        int count = appointmentParticipantRepository.countJoinedAppointmentsByMemberAndDate(member.getId(), year,
                month);
        long spent = transactionRepository.sumSpentFromTransactions(wallet.getId(), year, month);

        return AppointmentSummaryResponse.builder()
                .totalAttendanceCount(count)
                .totalSpent(spent)
                .name(member.getName())
                .imageUrl(member.getProfileImage())
                .build();
    }

    private Appointment validateHostAccess(Integer appointmentId) {
        Integer memberId = authUtil.getCurrentMember().getId();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, memberId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (participant.getRole() != Role.HOST || participant.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        return appointment;
    }


}
