package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Constant.Role;
import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Entity.AppointmentPlace;
import com.a601.moba.appointment.Entity.Place;
import com.a601.moba.appointment.Exception.AppointmentException;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentPlaceRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.appointment.Repository.PlaceRepository;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AppointmentPlaceService {

    private final AppointmentRepository appointmentRepository;
    private final PlaceRepository placeRepository;
    private final AuthUtil authUtil;
    private final AppointmentPlaceRepository appointmentPlaceRepository;
    private final AppointmentParticipantRepository appointmentParticipantRepository;

    public Map<String, Object> searchPlaces(String keyword, int size, Integer cursorId) {
        List<Place> places = placeRepository.searchByNameWithCursor(
                keyword.toLowerCase(),
                cursorId,
                PageRequest.of(0, size)
        );

        List<Map<String, Object>> results = places.stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("placeId", p.getCompanyCode());
                    map.put("name", p.getCompanyName());
                    map.put("latitude", p.getLatitude());
                    map.put("longitude", p.getLongitude());
                    map.put("category", p.getCategory());
                    map.put("kakaoUrl", p.getKakaoUrl());
                    return map;
                })
                .toList();

        Integer nextCursorId = places.isEmpty() ? null : places.get(places.size() - 1).getCompanyCode();

        return Map.of(
                "results", results,
                "cursorId", nextCursorId
        );
    }

    @Transactional
    public Map<String, Object> addPlaceToAppointment(Integer appointmentId, Integer placeId) {
        Member member = authUtil.getCurrentMember();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMemberId(appointment, member.getId())
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (participant.getRole() != Role.HOST || participant.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.PLACE_NOT_FOUND));

        int currentMaxOrder = appointmentPlaceRepository.countByAppointment(appointment);

        AppointmentPlace appointmentPlace = AppointmentPlace.builder()
                .appointment(appointment)
                .companyCode(place.getCompanyCode())
                .placeOrder(currentMaxOrder + 1)
                .name(place.getCompanyName())
                .category(place.getCategory())
                .latitude(place.getLatitude())
                .longitude(place.getLongitude())
                .kakaoUrl(place.getKakaoUrl())
                .build();

        appointmentPlaceRepository.save(appointmentPlace);

        return Map.of(
                "placeId", appointmentPlace.getId(),
                "name", appointmentPlace.getName(),
                "latitude", appointmentPlace.getLatitude(),
                "longitude", appointmentPlace.getLongitude(),
                "kakaoUrl", appointmentPlace.getKakaoUrl(),
                "address", place.getAddress()
        );
    }
    
}