package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Controller.Response.AppointmentSearchResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    public AppointmentSearchResponse searchAppointments(String keyword, int size, Integer cursorId) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return new AppointmentSearchResponse(List.of(), null);
        }

        Member member = authUtil.getCurrentMember();

        List<Appointment> appointments = appointmentRepository
                .findByNameContainingAndParticipantWithCursor(member.getId(), keyword, cursorId,
                        PageRequest.of(0, size));

        List<AppointmentSearchResponse.AppointmentResult> results = appointments.stream()
                .map(appointment -> new AppointmentSearchResponse.AppointmentResult(
                        appointment.getId(),
                        appointment.getName(),
                        appointment.getTime(),
                        appointment.getImage(),
                        appointment.getIsEnded()
                ))
                .toList();

        Integer nextCursorId = appointments.isEmpty() ? null :
                appointments.get(appointments.size() - 1).getId();

        return new AppointmentSearchResponse(results, nextCursorId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> searchMembersByKeyword(String keyword, Integer cursorId, int size) {
        Map<String, Object> result = new HashMap<>();

        if (keyword == null || keyword.trim().isBlank()) {
            result.put("members", Collections.emptyList());
            result.put("cursorId", null);
            return result;
        }

        List<Member> members = memberRepository.searchByKeywordWithCursor(
                keyword.toLowerCase(), cursorId, PageRequest.of(0, size)
        );

        List<Map<String, Object>> memberList = members.stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("memberId", m.getId());
                    map.put("name", m.getName());
                    map.put("email", m.getEmail());
                    map.put("profileImage", m.getProfileImage());
                    return map;
                })
                .toList();

        Integer nextCursorId = members.isEmpty() ? null : members.get(members.size() - 1).getId();
        
        return Map.of(
                "members", memberList,
                "cursorId", nextCursorId
        );
    }

    @Transactional(readOnly = true)
    public Map<String, Object> searchAppointmentsByKeyword(String keyword, Integer cursorId, int size) {
        Map<String, Object> result = new HashMap<>();
        if (keyword == null || keyword.trim().isBlank()) {
            result.put("appointments", Collections.emptyList());
            result.put("cursorId", null);
            return result;
        }

        List<Appointment> appointments = appointmentRepository.findByMemberKeyword(
                keyword.toLowerCase(), cursorId, PageRequest.of(0, size)
        );

        List<Map<String, Object>> appointmentList = appointments.stream()
                .map(a -> {
                    Map<String, Object> appointmentMap = new HashMap<>();
                    appointmentMap.put("appointmentId", a.getId());
                    appointmentMap.put("name", a.getName());
                    appointmentMap.put("time", a.getTime());
                    appointmentMap.put("imageUrl", a.getImage());
                    appointmentMap.put("isEnded", a.getIsEnded());

                    List<AppointmentParticipant> participants = appointmentParticipantRepository.findByAppointmentId(
                            a.getId());

                    List<Map<String, Object>> memberList = participants.stream()
                            .map(p -> {
                                Member m = memberRepository.findById(p.getMemberId()).orElse(null);
                                if (m == null) {
                                    return null;
                                }
                                Map<String, Object> mMap = new HashMap<>();
                                mMap.put("memberId", m.getId());
                                mMap.put("name", m.getName());
                                mMap.put("email", m.getEmail());
                                mMap.put("profileImage", m.getProfileImage());
                                return mMap;
                            })
                            .toList();

                    appointmentMap.put("members", memberList);
                    return appointmentMap;
                })
                .toList();

        Integer nextCursorId = appointments.isEmpty() ? null : appointments.get(appointments.size() - 1).getId();

        return Map.of(
                "appointments", appointmentList,
                "cursorId", nextCursorId
        );
    }

}
