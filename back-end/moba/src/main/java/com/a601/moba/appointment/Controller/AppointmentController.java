package com.a601.moba.appointment.Controller;

import com.a601.moba.appointment.Controller.Request.AppointmentCreateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentJoinRequest;
import com.a601.moba.appointment.Controller.Response.AppointmentCreateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentJoinResponse;
import com.a601.moba.appointment.Service.AppointmentService;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<JSONResponse<AppointmentCreateResponse>> create(
            @RequestPart("data") AppointmentCreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest httpRequest
    ) {
        AppointmentCreateResponse response = appointmentService.create(request, image, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_CREAT_SUCCESS, response));
    }

    @PostMapping("/join")
    public ResponseEntity<JSONResponse<AppointmentJoinResponse>> join(
            @RequestBody AppointmentJoinRequest request,
            HttpServletRequest httpRequest
    ) {
        AppointmentJoinResponse response = appointmentService.join(request, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_JOIN_SUCCESS, response));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<JSONResponse<AppointmentDetailResponse>> getAppointment(
            @PathVariable Integer appointmentId,
            HttpServletRequest httpRequest
    ) {
        AppointmentDetailResponse response = appointmentService.getDetail(appointmentId, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_READ_SUCCESS, response));
    }

    @PatchMapping("/{appointmentId}/leave")
    public ResponseEntity<JSONResponse<Void>> leave(
            @PathVariable Integer appointmentId,
            HttpServletRequest request
    ) {
        appointmentService.leave(appointmentId, request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_EXIT_SUCCESS));
    }

}
