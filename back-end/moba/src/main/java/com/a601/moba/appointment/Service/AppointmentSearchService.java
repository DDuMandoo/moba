package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Controller.Response.AppointmentSearchResponse;
import com.a601.moba.appointment.Controller.Response.FriendSearchResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AppointmentSearchService {

    private final MemberRepository memberRepository;
    private final AppointmentRepository appointmentRepository;
    private final AppointmentParticipantRepository appointmentParticipantRepository;

    public FriendSearchResponse searchFriends(String keyword, int size, Integer cursorId) {
        List<Member> members = memberRepository.findNextPageByKeywordAndCursor(
                keyword.toLowerCase(),
                cursorId,
                PageRequest.of(0, size)
        );

        Integer nextCursorId = members.isEmpty() ? null : members.get(members.size() - 1).getId();

        return FriendSearchResponse.of(keyword, members, nextCursorId);
    }

    public AppointmentSearchResponse searchAppointments(String keyword, int size, Integer cursorId) {
        // 1. 약속명 기준 검색
        List<Appointment> titleMatched = appointmentRepository.findByNameWithCursor(
                keyword != null ? keyword.toLowerCase() : null,
                cursorId,
                PageRequest.of(0, size * 2)
        );
        List<Appointment> resultAppointments = new ArrayList<>(titleMatched);

        // 2. 사람 이름 기준 검색
        if (keyword != null) {
            List<Member> matchedMembers = memberRepository.findByNameContainingIgnoreCase(keyword);

            if (!matchedMembers.isEmpty()) {
                List<Integer> matchedMemberIds = matchedMembers.stream()
                        .map(Member::getId)
                        .toList();

                List<AppointmentParticipant> participants = appointmentParticipantRepository.findByMemberIdIn(
                        matchedMemberIds);

                List<Appointment> fromParticipants = participants.stream()
                        .map(AppointmentParticipant::getAppointment)
                        .filter(a -> cursorId == null || a.getId() > cursorId)
                        .toList();

                resultAppointments.addAll(fromParticipants);
            }
        }

        // 3. 중복 제거, 정렬, 제한
        List<Appointment> newResultAppointments = resultAppointments.stream()
                .collect(Collectors.toMap(Appointment::getId, Function.identity(), (a, b) -> a))
                .values().stream()
                .sorted(Comparator.comparing(Appointment::getId))
                .limit(size)
                .toList();

        // === N+1 해결 ===
        // 4. appointmentId 목록
        List<Integer> appointmentIds = newResultAppointments.stream()
                .map(Appointment::getId)
                .toList();

        // 5. participants 한 번에 조회
        List<AppointmentParticipant> allParticipants =
                appointmentParticipantRepository.findByAppointmentIdIn(appointmentIds);

        // 6. memberId → 이름 매핑
        Set<Integer> memberIds = allParticipants.stream()
                .map(AppointmentParticipant::getMemberId)
                .collect(Collectors.toSet());

        Map<Integer, String> memberNameMap = memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getId, Member::getName));

        // 7. appointmentId → 참가자 목록 매핑
        Map<Integer, List<AppointmentParticipant>> groupedByAppointment =
                allParticipants.stream()
                        .collect(Collectors.groupingBy(p -> p.getAppointment().getId()));

        // 8. 응답 구성
        List<Map<String, Object>> results = new ArrayList<>();
        for (Appointment newResultAppointment : newResultAppointments) {
            List<String> participantNames = groupedByAppointment
                    .getOrDefault(newResultAppointment.getId(), List.of()).stream()
                    .map(p -> memberNameMap.getOrDefault(p.getMemberId(), "알 수 없음"))
                    .toList();

            Map<String, Object> item = new HashMap<>();
            item.put("appointmentId", newResultAppointment.getId());
            item.put("name", newResultAppointment.getName());
            item.put("time", newResultAppointment.getTime());
            item.put("participants", participantNames);
            results.add(item);
        }

        Integer nextCursorId =
                results.isEmpty() ? null : (Integer) results.get(results.size() - 1).get("appointmentId");

        return new AppointmentSearchResponse(results, nextCursorId);
    }

}
