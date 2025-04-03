package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Constant.Role;
import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Controller.Request.AppointmentPlaceOrderUpdateRequest;
import com.a601.moba.appointment.Controller.Response.AddAppointmentPlaceResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentPlaceListResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentPlaceOrderUpdateResponse;
import com.a601.moba.appointment.Controller.Response.PlaceInfo;
import com.a601.moba.appointment.Controller.Response.PlaceSearchResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentParticipant;
import com.a601.moba.appointment.Entity.AppointmentPlace;
import com.a601.moba.appointment.Entity.Place;
import com.a601.moba.appointment.Exception.AppointmentException;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentPlaceRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.appointment.Repository.PlaceRepository;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
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
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public PlaceSearchResponse searchPlaces(String keyword, int size, Integer cursorId) {
        if (keyword == null || keyword.trim().isBlank()) {
            return PlaceSearchResponse.builder()
                    .results(List.of())
                    .cursorId(null)
                    .build();
        }

        List<Place> places = placeRepository.searchByNameWithCursor(
                keyword.toLowerCase(),
                cursorId,
                PageRequest.of(0, size)
        );

        List<PlaceInfo> results = places.stream()
                .map(p -> PlaceInfo.builder()
                        .placeId(p.getCompanyCode())
                        .name(p.getCompanyName())
                        .latitude(p.getLatitude())
                        .longitude(p.getLongitude())
                        .category(p.getCategory())
                        .kakaoUrl(p.getKakaoUrl())
                        .build())
                .toList();

        Integer nextCursorId = places.isEmpty() ? null : places.get(places.size() - 1).getCompanyCode();

        return PlaceSearchResponse.builder()
                .results(results)
                .cursorId(nextCursorId)
                .build();
    }


    @Transactional
    public AddAppointmentPlaceResponse addPlaceToAppointment(Integer appointmentId, Integer placeId) {
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

        return AddAppointmentPlaceResponse.builder()
                .placeId(appointmentPlace.getId())
                .name(appointmentPlace.getName())
                .order(appointmentPlace.getOrder())
                .latitude(appointmentPlace.getLatitude())
                .longitude(appointmentPlace.getLongitude())
                .kakaoUrl(appointmentPlace.getKakaoUrl())
                .address(place.getAddress())
                .build();
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


    @Transactional(readOnly = true)
    public AppointmentPlaceListResponse getAppointmentPlaces(Integer appointmentId) {
        Member member = authUtil.getCurrentMember();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        boolean isParticipant = appointmentParticipantRepository
                .existsByAppointmentAndMemberAndState(appointment, member, State.JOINED);

        if (!isParticipant) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        List<AppointmentPlaceListResponse.PlaceInfo> placeList = appointmentPlaceRepository
                .findAllByAppointmentOrderByOrderAsc(appointment)
                .stream()
                .map(p -> AppointmentPlaceListResponse.PlaceInfo.builder()
                        .placeId(p.getCompanyCode())
                        .name(p.getName())
                        .latitude(p.getLatitude())
                        .longitude(p.getLongitude())
                        .address(p.getAddress())
                        .category(p.getCategory())
                        .build()
                )
                .toList();

        return new AppointmentPlaceListResponse(appointment.getId(), placeList);
    }


    @Transactional
    public AppointmentPlaceOrderUpdateResponse updatePlaceOrder(Integer appointmentId,
                                                                AppointmentPlaceOrderUpdateRequest request) {
        Member member = authUtil.getCurrentMember();
        Appointment appointment = validateHostAccess(appointmentId, member.getId());

        List<AppointmentPlace> allPlaces = appointmentPlaceRepository.findAllByAppointment(appointment);

        if (allPlaces.size() != request.places().size()) {
            throw new AppointmentException(ErrorCode.INVALID_REQUEST);
        }

        Map<Integer, AppointmentPlace> placeMap = allPlaces.stream()
                .collect(Collectors.toMap(AppointmentPlace::getId, p -> p));

        List<AppointmentPlaceOrderUpdateResponse.PlaceOrderResult> updatedPlaces = request.places().stream()
                .map(item -> {
                    AppointmentPlace place = placeMap.get(item.placeId());
                    if (place == null) {
                        throw new AppointmentException(ErrorCode.APPOINTMENT_PLACE_NOT_FOUND);
                    }
                    place.updateOrder(item.order());
                    return AppointmentPlaceOrderUpdateResponse.PlaceOrderResult.builder()
                            .placeId(item.placeId())
                            .order(item.order())
                            .build();
                })
                .toList();

        return new AppointmentPlaceOrderUpdateResponse(updatedPlaces);
    }


    private Appointment validateHostAccess(Integer appointmentId, Integer memberId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new AuthException(ErrorCode.MEMBER_NOT_FOUND));

        AppointmentParticipant participant = appointmentParticipantRepository
                .findByAppointmentAndMember(appointment, member)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED));

        if (participant.getRole() != Role.HOST || participant.getState() != State.JOINED) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        return appointment;
    }

}