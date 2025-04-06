package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Controller.Response.AppointmentSearchWithMembersResponse;
import com.a601.moba.appointment.Controller.Response.MemberSearchResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentSearchService {

    private final MemberRepository memberRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentParticipantRepository appointmentParticipantRepository;
    private final AuthUtil authUtil;

    public AppointmentSearchWithMembersResponse searchAppointments(String keyword, int size, Integer cursorId) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new AppointmentSearchWithMembersResponse(List.of(), null);
        }

        Member member = authUtil.getCurrentMember();

        List<Appointment> appointments = appointmentRepository
                .findByNameContainingAndParticipantWithCursor(member.getId(), keyword, cursorId,
                        PageRequest.of(0, size));

        List<AppointmentSearchWithMembersResponse.AppointmentInfo> results = appointments.stream()
                .map(appointment -> {
                    List<AppointmentParticipant> participants =
                            appointmentParticipantRepository.findAllByAppointmentId(appointment.getId());

                    List<AppointmentSearchWithMembersResponse.MemberInfo> memberInfos = participants.stream()
                            .map(AppointmentParticipant::getMember)
                            .filter(m -> !m.isDeleted())
                            .map(m -> AppointmentSearchWithMembersResponse.MemberInfo.builder()
                                    .memberId(m.getId())
                                    .name(m.getName())
                                    .email(m.getEmail())
                                    .profileImage(m.getProfileImage())
                                    .build())
                            .toList();

                    return AppointmentSearchWithMembersResponse.AppointmentInfo.builder()
                            .appointmentId(appointment.getId())
                            .name(appointment.getName())
                            .time(appointment.getTime())
                            .imageUrl(appointment.getImage())
                            .isEnded(appointment.getIsEnded())
                            .members(memberInfos)
                            .build();
                })
                .toList();

        Integer nextCursorId = appointments.isEmpty() ? null :
                appointments.get(appointments.size() - 1).getId();

        return new AppointmentSearchWithMembersResponse(results, nextCursorId);
    }

    @Transactional(readOnly = true)
    public MemberSearchResponse searchMembersByKeyword(String keyword, Integer cursorId, int size) {
        if (keyword == null || keyword.trim().isBlank()) {
            return new MemberSearchResponse(List.of(), null);
        }

        List<Member> members = memberRepository.searchByKeywordWithCursor(
                keyword.toLowerCase(), cursorId, PageRequest.of(0, size)
        );

        List<MemberSearchResponse.MemberInfo> memberInfos = members.stream()
                .map(m -> MemberSearchResponse.MemberInfo.builder()
                        .memberId(m.getId())
                        .name(m.getName())
                        .email(m.getEmail())
                        .profileImage(m.getProfileImage())
                        .build())
                .toList();

        Integer nextCursorId = members.isEmpty() ? null : members.get(members.size() - 1).getId();

        return new MemberSearchResponse(memberInfos, nextCursorId);
    }


    @Transactional(readOnly = true)
    public AppointmentSearchWithMembersResponse searchAppointmentsByKeyword(String keyword, Integer cursorId,
                                                                            int size) {
        if (keyword == null || keyword.trim().isBlank()) {
            return new AppointmentSearchWithMembersResponse(List.of(), null);
        }

        List<Appointment> appointments = appointmentRepository.findByMemberKeyword(
                keyword.toLowerCase(), cursorId, PageRequest.of(0, size)
        );

        List<AppointmentSearchWithMembersResponse.AppointmentInfo> appointmentList = appointments.stream()
                .map(a -> {
                    List<AppointmentParticipant> participants = appointmentParticipantRepository.findByAppointmentId(
                            a.getId());

                    List<AppointmentSearchWithMembersResponse.MemberInfo> members = participants.stream()
                            .map(AppointmentParticipant::getMember)
                            .filter(m -> !m.isDeleted())
                            .map(m -> AppointmentSearchWithMembersResponse.MemberInfo.builder()
                                    .memberId(m.getId())
                                    .name(m.getName())
                                    .email(m.getEmail())
                                    .profileImage(m.getProfileImage())
                                    .build())
                            .toList();

                    return AppointmentSearchWithMembersResponse.AppointmentInfo.builder()
                            .appointmentId(a.getId())
                            .name(a.getName())
                            .time(a.getTime())
                            .imageUrl(a.getImage())
                            .isEnded(a.getIsEnded())
                            .members(members)
                            .build();
                })
                .toList();

        Integer nextCursorId = appointments.isEmpty() ? null : appointments.get(appointments.size() - 1).getId();

        return new AppointmentSearchWithMembersResponse(appointmentList, nextCursorId);
    }


}
