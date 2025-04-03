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
import com.a601.moba.appointment.Controller.Response.GetLocationAppointmentResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Exception.AppointmentException;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.appointment.Util.InviteCodeGenerator;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.service.S3Service;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.wallet.Entity.Wallet;
import com.a601.moba.wallet.Repository.TransactionRepository;
import com.a601.moba.wallet.Repository.WalletRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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
    private final LocationRedisService locationRedisService;

    public Appointment getAppointment(Integer appointmentId) {
        return appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));
    }

    @Transactional
    public AppointmentCreateResponse create(AppointmentCreateRequest request, MultipartFile image) {
        String inviteCode = inviteCodeGenerator.generate()
                .orElseThrow(() -> new AppointmentException(ErrorCode.INVITE_CODE_GENERATION_FAILED));

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = s3Service.uploadFile(image);
        }

        Appointment appointment = appointmentRepository.save(Appointment.builder()
                .name(request.name())
                .image(imageUrl)
                .time(request.time())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .memo(request.memo())
                .inviteUrl(inviteCode)
                .isEnded(false)
                .build());

        List<AppointmentParticipant> participants = new ArrayList<>();
        Member host = authUtil.getCurrentMember();
        participants.add(createAppointmentParticipant(appointment, host, Role.HOST, State.JOINED));

        List<Member> members = memberRepository.findAllByIdIn(request.friends());
        for (Member m : members) {
            participants.add(createAppointmentParticipant(appointment, m, Role.PARTICIPANT, State.WAIT));
        }

        appointmentParticipantRepository.saveAll(participants);

        return AppointmentCreateResponse.builder()
                .appointmentId(appointment.getId())
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

    public AppointmentParticipant createAppointmentParticipant(Appointment appointment, Member member, Role role,
                                                               State state) {
        return AppointmentParticipant.builder()
                .appointment(appointment)
                .member(member)
                .role(role)
                .state(state)
                .joinAt(LocalDateTime.now())
                .build();
    }

    @Transactional
    public AppointmentJoinResponse join(AppointmentJoinRequest request) {
        Member member = authUtil.getCurrentMember();

        Appointment appointment = getAppointment(request.appointmentId());

        Optional<AppointmentParticipant> existingParticipantOpt =
                appointmentParticipantRepository.findByAppointmentAndMember(appointment, member);

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
            if (state == State.LEAVE || state == State.WAIT) {
                existingParticipant.updateState(State.JOINED);
                participant = existingParticipant;
            } else {
                throw new AppointmentException(ErrorCode.INVALID_REQUEST);
            }
        } else {
            participant = AppointmentParticipant.builder()
                    .appointment(appointment)
                    .member(member)
                    .role(Role.PARTICIPANT)
                    .state(State.JOINED)
                    .joinAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            appointmentParticipantRepository.save(participant);
        }

        return AppointmentJoinResponse.builder()
                .appointmentId(appointment.getId())
                .name(appointment.getName())
                .participant(AppointmentJoinResponse.ParticipantInfo.builder()
                        .memberId(member.getId())
                        .name(member.getName())
                        .joinedAt(participant.getJoinAt())
                        .build())
                .build();
    }

    public AppointmentDetailResponse getDetail(Integer appointmentId) {
        Member member = authUtil.getCurrentMember();

        Appointment appointment = getAppointment(appointmentId);

        // 본인이 JOINED 상태의 참여자인지 확인
        AppointmentParticipant self = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, member)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (self.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        // JOINED 상태의 참여자만 필터링
        List<AppointmentParticipant> participantList = appointmentParticipantRepository
                .findAllByAppointment(appointment).stream()
                .filter(p -> p.getState() == State.JOINED)
                .toList();

        Integer hostId = participantList.stream()
                .filter(p -> p.getRole() == Role.HOST)
                .findFirst()
                .map(p -> p.getMember().getId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        List<ParticipantInfo> participants = participantList.stream()
                .map(p -> {
                    return ParticipantInfo.builder()
                            .memberId(p.getMember().getId())
                            .name(p.getMember().getName())
                            .profileImage(p.getMember().getProfileImage())
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
                .hostId(hostId)
                .build();
    }


    @Transactional
    public void leave(Integer appointmentId) {
        Member member = authUtil.getCurrentMember();

        Appointment appointment = getAppointment(appointmentId);

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, member)
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
        Member member = authUtil.getCurrentMember();

        Appointment appointment = getAppointment(appointmentId);

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, member)
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
        Member member = authUtil.getCurrentMember();

        Appointment appointment = getAppointment(appointmentId);

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, member)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (participant.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        List<AppointmentParticipant> joinedParticipants = appointmentParticipantRepository
                .findAllByAppointment(appointment).stream()
                .filter(p -> p.getState() == State.JOINED)
                .toList();

        List<AppointmentParticipantResponse.ParticipantInfo> participants = joinedParticipants.stream()
                .map(p -> {
                    return AppointmentParticipantResponse.ParticipantInfo.builder()
                            .memberId(p.getMember().getId())
                            .name(p.getMember().getName())
                            .profileImage(p.getMember().getProfileImage())
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
        Member host = memberRepository.findById(request.newHostId())
                .orElseThrow(() -> new AuthException(ErrorCode.MEMBER_NOT_FOUND));
        Appointment appointment = validateHostAccess(appointmentId);

        AppointmentParticipant currentHost = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, currentMember)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        AppointmentParticipant newHost = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, host)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        if (newHost.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.INVALID_REQUEST);
        }

        // 권한 위임
        currentHost.updateRole(Role.PARTICIPANT);
        newHost.updateRole(Role.HOST);

        return AppointmentDelegateResponse.builder()
                .preHostId(currentHost.getMember().getId())
                .preHostName(currentHost.getMember().getName())
                .newHostId(newHost.getMember().getId())
                .newHostName(newHost.getMember().getName())
                .build();
    }


    @Transactional
    public void kickParticipant(Integer appointmentId, AppointmentKickRequest request) {
        Appointment appointment = validateHostAccess(appointmentId);
        Member member = memberRepository.findById(request.memberId())
                .orElseThrow(() -> new AuthException(ErrorCode.MEMBER_NOT_FOUND));

        AppointmentParticipant target = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, member)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND));

        if (target.getRole() == Role.HOST) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_KICK_FORBIDDEN);
        }

        target.updateState(State.KICKED);
    }

    public List<AppointmentListItemResponse> getMyAppointments(Integer year, Integer month) {
        Member member = authUtil.getCurrentMember();

        List<AppointmentParticipant> participants = appointmentParticipantRepository
                .findAllByMemberAndState(member, State.JOINED);

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
        Member member = authUtil.getCurrentMember();

        Appointment appointment = getAppointment(appointmentId);

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, member)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (participant.getRole() != Role.HOST || participant.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        return appointment;
    }

    public GetLocationAppointmentResponse getLocation(Integer appointmentId) {
        Member member = authUtil.getCurrentMember();
        Appointment appointment = getAppointment(appointmentId);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime tenMinutesBefore = appointment.getTime().minusMinutes(10);

        if (now.isBefore(tenMinutesBefore) || now.isAfter(appointment.getTime())) {
            throw new AppointmentException(ErrorCode.INVALID_APPOINTMENT_TIME);
        }

        if (!appointmentParticipantRepository.existsByAppointmentAndMemberAndState(appointment, member, State.JOINED)) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_PARTICIPANT_NOT_FOUND);
        }

        List<AppointmentParticipant> participants = appointmentParticipantRepository.findAllByAppointment(appointment);
        List<GetLocationAppointmentResponse.Participant> responseParticipants = new ArrayList<>();
        for (AppointmentParticipant p : participants) {
            String location = locationRedisService.getLocation(p.getMember().getId());
            if (location == null) {
                continue;
            }
            String[] parts = location.split(",");

            double latitude = Double.parseDouble(parts[0]);
            double longitude = Double.parseDouble(parts[1]);
            responseParticipants.add(GetLocationAppointmentResponse.Participant.builder()
                    .memberId(p.getMember().getId())
                    .memberName(p.getMember().getName())
                    .memberImage(p.getMember().getProfileImage())
                    .latitude(latitude)
                    .longitude(longitude)
                    .build());
        }
        return GetLocationAppointmentResponse.builder()
                .appointmentId(appointment.getId())
                .participants(responseParticipants)
                .build();
    }
}
