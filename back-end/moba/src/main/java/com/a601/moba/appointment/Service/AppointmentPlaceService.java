package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Constant.Role;
import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Controller.Request.AppointmentPlaceOrderUpdateRequest;
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
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
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
        if (keyword == null || keyword.trim().isBlank()) {
            return Map.of(
                    "results", Collections.emptyList(),
                    "cursorId", null
            );
        }

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

        Appointment appointment = validateHostAccess(appointmentId, member.getId());

        Place place = placeRepository.findById(placeId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.PLACE_NOT_FOUND));

        int currentMaxOrder = appointmentPlaceRepository.countByAppointment(appointment);

        AppointmentPlace appointmentPlace = AppointmentPlace.builder()
                .appointment(appointment)
                .companyCode(place.getCompanyCode())
                .order(currentMaxOrder + 1)
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
                "order", appointmentPlace.getOrder(),
                "latitude", appointmentPlace.getLatitude(),
                "longitude", appointmentPlace.getLongitude(),
                "kakaoUrl", appointmentPlace.getKakaoUrl(),
                "address", place.getAddress()
        );
    }


    @Transactional
    public void deletePlaceFromAppointment(Integer appointmentId, Integer appointmentPlaceId) {
        Member member = authUtil.getCurrentMember();
        Appointment appointment = validateHostAccess(appointmentId, member.getId());

        AppointmentPlace target = appointmentPlaceRepository.findById(appointmentPlaceId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_PLACE_NOT_FOUND));

        if (!target.getAppointment().getId().equals(appointmentId)) {
            throw new AppointmentException(ErrorCode.INVALID_REQUEST);
        }

        appointmentPlaceRepository.delete(target);

        List<AppointmentPlace> remainingPlaces =
                appointmentPlaceRepository.findAllByAppointmentOrderByOrderAsc(appointment);

        for (int i = 0; i < remainingPlaces.size(); i++) {
            remainingPlaces.get(i).updateOrder(i + 1);
        }
    }


    public Map<String, Object> getAppointmentPlaces(Integer appointmentId) {
        Member member = authUtil.getCurrentMember();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        boolean isParticipant = appointmentParticipantRepository
                .existsByAppointmentAndMemberIdAndState(appointment, member.getId(), State.JOINED);

        if (!isParticipant) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        List<AppointmentPlace> places = appointmentPlaceRepository
                .findAllByAppointmentOrderByOrderAsc(appointment);

        List<Map<String, Object>> placeList = places.stream()
                .map(p -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("placeId", p.getCompanyCode());
                    map.put("name", p.getName());
                    map.put("latitude", p.getLatitude());
                    map.put("longitude", p.getLongitude());
                    map.put("address", p.getAddress());
                    map.put("category", p.getCategory());
                    return map;
                })
                .toList();

        return Map.of(
                "appointmentId", appointment.getId(),
                "places", placeList
        );
    }

    @Transactional
    public Map<String, Object> updatePlaceOrder(Integer appointmentId, AppointmentPlaceOrderUpdateRequest request) {
        Member member = authUtil.getCurrentMember();
        Appointment appointment = validateHostAccess(appointmentId, member.getId());

        List<AppointmentPlace> allPlaces = appointmentPlaceRepository.findAllByAppointment(appointment);

        if (allPlaces.size() != request.places().size()) {
            throw new AppointmentException(ErrorCode.INVALID_REQUEST); // 순서 갱신은 약속방의 모든 장소에 대해 전달되어야 함
        }

        Map<Integer, AppointmentPlace> placeMap = allPlaces.stream()
                .collect(Collectors.toMap(AppointmentPlace::getId, p -> p));

        List<Map<String, Object>> updatedPlaces = new ArrayList<>();

        for (AppointmentPlaceOrderUpdateRequest.PlaceOrderItem item : request.places()) {
            AppointmentPlace place = placeMap.get(item.placeId());

            if (place == null) {
                throw new AppointmentException(ErrorCode.APPOINTMENT_PLACE_NOT_FOUND);
            }

            place.updateOrder(item.order()); // 프론트에서 보내준 order 사용

            updatedPlaces.add(Map.of(
                    "placeId", item.placeId(),
                    "order", item.order()
            ));
        }

        return Map.of("updatedPlaces", updatedPlaces);
    }


    private Appointment validateHostAccess(Integer appointmentId, Integer memberId) {
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