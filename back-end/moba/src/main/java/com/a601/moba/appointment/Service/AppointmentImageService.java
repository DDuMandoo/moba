package com.a601.moba.appointment.Service;

import com.a601.moba.appointment.Constant.State;
import com.a601.moba.appointment.Controller.Response.AppointmentImageInfo;
import com.a601.moba.appointment.Controller.Response.AppointmentImageListResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentImageUploadListResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentImageUploadResponse;
import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Entity.AppointmentImage;
import com.a601.moba.appointment.Exception.AppointmentException;
import com.a601.moba.appointment.Repository.AppointmentImageRepository;
import com.a601.moba.appointment.Repository.AppointmentParticipantRepository;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.service.S3Service;
import com.a601.moba.member.Entity.Member;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AppointmentImageService {

    private final AppointmentRepository appointmentRepository;
    private final AppointmentParticipantRepository appointmentParticipantRepository;
    private final AppointmentImageRepository appointmentImageRepository;
    private final S3Service s3Service;
    private final AuthUtil authUtil;

    @Transactional
    public AppointmentImageUploadListResponse uploadImages(Integer appointmentId, List<MultipartFile> images) {
        Member member = authUtil.getCurrentMember();

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        boolean isParticipant = appointmentParticipantRepository
                .existsByAppointmentAndMemberAndState(appointment, member, State.JOINED);

        if (!isParticipant) {
            throw new AppointmentException(ErrorCode.APPOINTMENT_ACCESS_DENIED);
        }

        List<AppointmentImageUploadResponse> responses = new ArrayList<>();

        for (MultipartFile image : images) {
            String url = s3Service.uploadFile(image);

            AppointmentImage saved = appointmentImageRepository.save(
                    AppointmentImage.builder()
                            .appointment(appointment)
                            .imageUrl(url)
                            .build()
            );

            responses.add(AppointmentImageUploadResponse.builder()
                    .appointmentId(appointment.getId())
                    .imageId(saved.getId())
                    .build());
        }

        return AppointmentImageUploadListResponse.builder()
                .images(responses)
                .build();
    }

    @Transactional(readOnly = true)
    public AppointmentImageListResponse getImages(Integer appointmentId, int size, Integer cursorId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));

        Pageable pageable = PageRequest.of(0, size);

        List<AppointmentImage> images = appointmentImageRepository
                .findByAppointmentWithCursor(appointment, cursorId, pageable);

        List<AppointmentImageInfo> imageList = images.stream()
                .map(img -> AppointmentImageInfo.builder()
                        .imageId(img.getId())
                        .imageUrl(img.getImageUrl())
                        .build())
                .toList();

        Integer nextCursorId = images.isEmpty() ? null : images.get(images.size() - 1).getId();

        return AppointmentImageListResponse.builder()
                .images(imageList)
                .nextCursorId(nextCursorId)
                .build();
    }

}
