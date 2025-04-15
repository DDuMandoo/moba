package com.a601.moba.appointment.Controller.Response;

import com.a601.moba.member.Entity.Member;
import java.util.List;
import lombok.Builder;

@Builder
public record FriendSearchResponse(
        String keyword,
        List<SimpleMember> results,
        Integer cursorId
) {
    public static FriendSearchResponse of(String keyword, List<Member> members, Integer cursorId) {
        List<SimpleMember> resultList = members.stream()
                .map(m -> new SimpleMember(m.getId(), m.getName(), m.getEmail(), m.getProfileImage()))
                .toList();

        return FriendSearchResponse.builder()
                .keyword(keyword)
                .results(resultList)
                .cursorId(cursorId)
                .build();
    }

    public record SimpleMember(Integer memberId, String name, String email, String profileImage) {
    }
}
