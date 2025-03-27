package com.a601.moba.appointment.Controller;

import com.a601.moba.appointment.Controller.Request.AppointmentCreateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentJoinRequest;
import com.a601.moba.appointment.Controller.Response.AppointmentCreateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentJoinResponse;
import com.a601.moba.appointment.Service.AppointmentService;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@Tag(name = "약속 API", description = "약속방(채팅방) 관련 기능")
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;

    @Operation(summary = "약속방 생성", description = "약속방(채팅방)을 생성합니다.")
    @PostMapping
    public ResponseEntity<JSONResponse<AppointmentCreateResponse>> create(
            @RequestPart("data") @Parameter(description = "약속 생성 요청 데이터") AppointmentCreateRequest request,
            @RequestPart(value = "image", required = false)
            @Parameter(description = "대표 이미지 (선택)") MultipartFile image,
            HttpServletRequest httpRequest
    ) {
        AppointmentCreateResponse response = appointmentService.create(request, image, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_CREAT_SUCCESS, response));
    }

    @Operation(summary = "약속방 참여", description = "약속방에 참여합니다.")
    @PostMapping("/join")
    public ResponseEntity<JSONResponse<AppointmentJoinResponse>> join(
            @RequestBody @Parameter(description = "약속 참여 요청") AppointmentJoinRequest request,
            HttpServletRequest httpRequest
    ) {
        AppointmentJoinResponse response = appointmentService.join(request, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_JOIN_SUCCESS, response));
    }

    @Operation(summary = "약속방 조회", description = "특정 약속방의 상세 정보를 조회합니다.")
    @GetMapping("/{appointmentId}")
    public ResponseEntity<JSONResponse<AppointmentDetailResponse>> getAppointment(
            @Parameter(description = "조회할 약속 ID", example = "1")
            @PathVariable Integer appointmentId,
            HttpServletRequest httpRequest
    ) {
        AppointmentDetailResponse response = appointmentService.getDetail(appointmentId, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_READ_SUCCESS, response));
    }

    @Operation(summary = "약속방 나가기", description = "현재 사용자가 약속방에서 나갑니다.")
    @PatchMapping("/{appointmentId}/leave")
    public ResponseEntity<JSONResponse<Void>> leave(
            @Parameter(description = "약속 ID", example = "1")
            @PathVariable Integer appointmentId,
            HttpServletRequest request
    ) {
        appointmentService.leave(appointmentId, request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_EXIT_SUCCESS));
    }
}
