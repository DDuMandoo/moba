package com.a601.moba.appointment.Controller;

import com.a601.moba.appointment.Controller.Request.AppointmentCreateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentDelegateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentJoinRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentKickRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentUpdateRequest;
import com.a601.moba.appointment.Controller.Response.AppointmentCreateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDelegateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentJoinResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentParticipantResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentUpdateResponse;
import com.a601.moba.appointment.Service.AppointmentService;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
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

    @Operation(
            summary = "약속방 생성",
            description = "약속방(채팅방)을 생성합니다. 약속 이름, 시간, 장소 등의 정보와 함께 대표 이미지를 업로드할 수 있습니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "약속 생성 요청 데이터 (JSON + 이미지)",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "약속방 생성을 성공하였습니다.")
            }
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JSONResponse<AppointmentCreateResponse>> create(
            @Parameter(description = "약속 생성 요청 데이터(JSON)", required = true)
            @RequestPart("data") @Valid AppointmentCreateRequest request,

            @Parameter(description = "대표 이미지 파일 (선택)")
            @RequestPart(value = "image", required = false) MultipartFile image,

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

    @Operation(
            summary = "약속방 정보 수정",
            description = "HOST만 약속명을 포함한 약속 정보를 수정할 수 있습니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "수정할 약속 정보 (JSON + 이미지)",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "약속방 정보를 수정하였습니다.")
            }
    )
    @PatchMapping(value = "/{appointmentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AppointmentUpdateResponse> update(
            @Parameter(description = "약속 ID", example = "1")
            @PathVariable Integer appointmentId,
            @RequestPart("data") @Valid AppointmentUpdateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            HttpServletRequest httpRequest) {

        AppointmentUpdateResponse response = appointmentService.update(appointmentId, request, image, httpRequest);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "약속방 이미지 삭제",
            description = "약속의 대표 이미지를 삭제합니다. HOST만 가능하며, 성공 시 null로 초기화됩니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "약속 이미지 삭제에 성공하였습니다.")
            }
    )
    @DeleteMapping("/{appointmentId}/image")
    public ResponseEntity<JSONResponse<Void>> deleteAppointmentImage(
            @PathVariable Integer appointmentId,
            HttpServletRequest request) {

        appointmentService.deleteImage(appointmentId, request);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_IMAGE_DELETE_SUCCESS));
    }

    @Operation(
            summary = "약속 종료",
            description = "약속방을 종료합니다. 방장(HOST)만 종료할 수 있으며, 데이터는 삭제되지 않고 isEnded 필드만 true로 변경됩니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "약속방 종료에 성공하였습니다.")
            }
    )
    @DeleteMapping("/{appointmentId}")
    public ResponseEntity<JSONResponse<Void>> end(
            @Parameter(description = "종료할 약속 ID", example = "1")
            @PathVariable Integer appointmentId,
            HttpServletRequest request
    ) {
        appointmentService.end(appointmentId, request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_END_SUCCESS));
    }

    @Operation(
            summary = "약속 참가자 목록 조회",
            description = "해당 약속에 JOINED 상태인 모든 참가자 목록을 조회합니다. 본인도 JOINED 상태여야 조회할 수 있습니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "참여자 목록 조회에 성공하였습니다.")
            }
    )
    @GetMapping("/{appointmentId}/participants")
    public ResponseEntity<JSONResponse<AppointmentParticipantResponse>> getParticipants(
            @Parameter(description = "약속 ID", example = "1")
            @PathVariable Integer appointmentId,
            HttpServletRequest request
    ) {
        AppointmentParticipantResponse response = appointmentService.getParticipants(appointmentId, request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_PARTICIPANTS_FETCH_SUCCESS, response));
    }

    @Operation(
            summary = "방장 권한 위임",
            description = "현재 방장이 다른 참여자에게 방장 권한을 위임합니다. 위임 후 기존 방장은 일반 참가자로 변경됩니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "방장 위임에 성공하였습니다.")
            }
    )
    @PatchMapping("/{appointmentId}/delegate")
    public ResponseEntity<JSONResponse<AppointmentDelegateResponse>> delegateHost(
            @Parameter(description = "약속 ID", example = "1")
            @PathVariable Integer appointmentId,
            @RequestBody @Valid AppointmentDelegateRequest request,
            HttpServletRequest httpRequest
    ) {
        AppointmentDelegateResponse response = appointmentService.delegateHost(appointmentId, request, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, response));
    }

    @Operation(
            summary = "약속방 강제 퇴장",
            description = "방장이 특정 참여자를 강제 퇴장시킵니다. 퇴장 대상은 HOST가 될 수 없습니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "강제 퇴장에 성공하였습니다.")
            }
    )
    @PatchMapping("/{appointmentId}/kick")
    public ResponseEntity<JSONResponse<Void>> kickParticipant(
            @Parameter(description = "약속방 ID", example = "1")
            @PathVariable Integer appointmentId,
            @RequestBody @Valid AppointmentKickRequest request,
            HttpServletRequest httpRequest
    ) {
        appointmentService.kickParticipant(appointmentId, request, httpRequest);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_PARTICIPANT_KICK_SUCCESS));
    }

}
