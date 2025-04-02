package com.a601.moba.appointment.Controller;

import com.a601.moba.appointment.Controller.Request.AppointmentCreateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentDelegateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentJoinRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentKickRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentPlaceOrderUpdateRequest;
import com.a601.moba.appointment.Controller.Request.AppointmentUpdateRequest;
import com.a601.moba.appointment.Controller.Response.AddAppointmentPlaceResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentCreateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDelegateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentDetailResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentImageListResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentImageUploadListResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentJoinResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentListItemResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentParticipantResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentPlaceListResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentPlaceOrderUpdateResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentSearchWithMembersResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentSummaryResponse;
import com.a601.moba.appointment.Controller.Response.AppointmentUpdateResponse;
import com.a601.moba.appointment.Controller.Response.MemberSearchResponse;
import com.a601.moba.appointment.Controller.Response.PlaceSearchResponse;
import com.a601.moba.appointment.Service.AppointmentImageService;
import com.a601.moba.appointment.Service.AppointmentPlaceService;
import com.a601.moba.appointment.Service.AppointmentSearchService;
import com.a601.moba.appointment.Service.AppointmentService;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Encoding;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "약속 API", description = "약속방(채팅방) 관련 기능")
@RestController
@Validated
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AppointmentSearchService appointmentSearchService;
    private final AppointmentImageService appointmentImageService;
    private final AppointmentPlaceService appointmentPlaceService;

    @Operation(
            summary = "약속방 생성",
            description = "약속 이름, 시간, 장소 정보와 대표 이미지를 업로드합니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            encoding = {
                                    @Encoding(name = "data", contentType = MediaType.APPLICATION_JSON_VALUE), // JSON 파트
                                    @Encoding(name = "image", contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE)
                            }
                    )
            )
    )
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JSONResponse<AppointmentCreateResponse>> create(
            @Parameter(description = "약속 생성 요청 데이터(JSON)", required = true)
            @RequestPart("data") @Valid AppointmentCreateRequest request,

            @Parameter(description = "대표 이미지 파일 (선택)")
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        AppointmentCreateResponse response = appointmentService.create(request, image);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_CREAT_SUCCESS, response));
    }

    @Operation(summary = "약속방 참여", description = "약속방에 참여합니다.")
    @PostMapping("/join")
    public ResponseEntity<JSONResponse<AppointmentJoinResponse>> join(
            @RequestBody @Parameter(description = "약속 참여 요청") AppointmentJoinRequest request
    ) {
        AppointmentJoinResponse response = appointmentService.join(request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_JOIN_SUCCESS, response));
    }

    @Operation(summary = "약속방 조회", description = "특정 약속방의 상세 정보를 조회합니다.")
    @GetMapping("/{appointmentId}")
    public ResponseEntity<JSONResponse<AppointmentDetailResponse>> getAppointment(
            @Parameter(description = "조회할 약속 ID", example = "1")
            @PathVariable Integer appointmentId
    ) {
        AppointmentDetailResponse response = appointmentService.getDetail(appointmentId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_READ_SUCCESS, response));
    }

    @Operation(summary = "약속방 나가기", description = "현재 사용자가 약속방에서 나갑니다.")
    @PatchMapping("/{appointmentId}/leave")
    public ResponseEntity<JSONResponse<Void>> leave(
            @Parameter(description = "약속 ID", example = "1")
            @PathVariable Integer appointmentId
    ) {
        appointmentService.leave(appointmentId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_EXIT_SUCCESS));
    }

    @Operation(
            summary = "약속방 정보 수정",
            description = "HOST만 약속명을 포함한 약속 정보를 수정할 수 있습니다.",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "수정할 약속 정보 (JSON + 이미지)",
                    required = true,
                    content = @Content(
                            mediaType = MediaType.MULTIPART_FORM_DATA_VALUE,
                            encoding = {
                                    @Encoding(name = "data", contentType = MediaType.APPLICATION_JSON_VALUE), // JSON 파트
                                    @Encoding(name = "image", contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE)
                            }
                    )
            ),
            responses = {
                    @ApiResponse(responseCode = "200", description = "약속방 정보를 수정하였습니다.")
            }
    )
    @PatchMapping(value = "/{appointmentId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JSONResponse<AppointmentUpdateResponse>> update(
            @Parameter(description = "약속 ID", example = "1")
            @PathVariable Integer appointmentId,
            @RequestPart("data") @Valid AppointmentUpdateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image) {

        AppointmentUpdateResponse response = appointmentService.update(appointmentId, request, image);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_UPDATE_SUCCESS, response));
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
            @PathVariable Integer appointmentId) {

        appointmentService.deleteImage(appointmentId);

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
            @PathVariable Integer appointmentId
    ) {
        appointmentService.end(appointmentId);
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
            @PathVariable Integer appointmentId
    ) {
        AppointmentParticipantResponse response = appointmentService.getParticipants(appointmentId);
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
            @RequestBody @Valid AppointmentDelegateRequest request
    ) {
        AppointmentDelegateResponse response = appointmentService.delegateHost(appointmentId, request);
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
            @RequestBody @Valid AppointmentKickRequest request
    ) {
        appointmentService.kickParticipant(appointmentId, request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_PARTICIPANT_KICK_SUCCESS));
    }

    @Operation(summary = "사용자 약속 조회", description = "연/월 파라미터가 있으면 해당 월 약속 조회, 없으면 전체 약속 조회")
    @GetMapping
    public ResponseEntity<JSONResponse<List<AppointmentListItemResponse>>> getMyAppointments(
            @Parameter(description = "연도") @RequestParam(required = false) Integer year,
            @Parameter(description = "월") @RequestParam(required = false) Integer month
    ) {
        List<AppointmentListItemResponse> response = appointmentService.getMyAppointments(year, month);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_READ_SUCCESS, response));
    }

    @Operation(summary = "약속 통계 조회", description = "특정 연/월에 참여한 약속 횟수 및 소비 금액을 반환합니다.")
    @GetMapping("/summary")
    public ResponseEntity<JSONResponse<AppointmentSummaryResponse>> getAppointmentSummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month
    ) {
        AppointmentSummaryResponse response = appointmentService.getAppointmentSummary(year, month);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_STATISTICS_SUCCESS, response));
    }

    @Operation(summary = "약속명으로 약속 검색")
    @GetMapping("/search")
    public ResponseEntity<JSONResponse<AppointmentSearchWithMembersResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "10") @Min(0) int size,
            @RequestParam(required = false) Integer cursorId) {

        AppointmentSearchWithMembersResponse response =
                appointmentSearchService.searchAppointments(keyword, size, cursorId);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEARCH_SUCCESS, response));
    }


    @Operation(summary = "참가자 이름으로 참가자 검색", description = "키워드(이름 또는 이메일)로 참가자를 검색합니다.")
    @GetMapping("/search/member")
    public ResponseEntity<JSONResponse<MemberSearchResponse>> searchMembers(
            @Parameter(description = "검색할 이름 또는 이메일")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "한 번에 불러올 개수 (기본값: 10)")
            @RequestParam(defaultValue = "10") @Min(0) int size,

            @Parameter(description = "마지막으로 불러온 memberId (커서)")
            @RequestParam(required = false) Integer cursorId) {

        MemberSearchResponse result = appointmentSearchService.searchMembersByKeyword(keyword, cursorId, size);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEARCH_SUCCESS, result));
    }


    @Operation(summary = "참가자 이름으로 약속 검색", description = "키워드(이름 또는 이메일)로 해당 참가자가 포함된 약속을 검색합니다.")
    @GetMapping("/search/appointment")
    public ResponseEntity<JSONResponse<AppointmentSearchWithMembersResponse>> searchAppointments(
            @Parameter(description = "검색할 이름 또는 이메일")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "한 번에 불러올 개수 (기본값: 10)")
            @RequestParam(defaultValue = "10") @Min(0) int size,

            @Parameter(description = "마지막으로 불러온 appointmentId (커서)")
            @RequestParam(required = false) Integer cursorId) {

        AppointmentSearchWithMembersResponse response = appointmentSearchService.searchAppointmentsByKeyword(keyword,
                cursorId, size);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEARCH_SUCCESS, response));
    }


    @Operation(summary = "약속 이미지 업로드", description = "약속 참여자가 약속방에 여러 이미지를 업로드합니다.")
    @PostMapping(value = "/{appointmentId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<JSONResponse<AppointmentImageUploadListResponse>> uploadAppointmentImages(
            @PathVariable Integer appointmentId,
            @RequestPart("images") List<MultipartFile> images) {

        AppointmentImageUploadListResponse response = appointmentImageService.uploadImages(appointmentId, images);
        return ResponseEntity.ok(
                JSONResponse.of(SuccessCode.APPOINTMENT_IMAGE_UPLOAD_SUCCESS, response)
        );
    }


    @Operation(summary = "약속 이미지 목록 조회", description = "해당 약속의 업로드된 이미지들을 커서 기반으로 조회")
    @GetMapping("/{appointmentId}/images")
    public ResponseEntity<JSONResponse<AppointmentImageListResponse>> getAppointmentImages(
            @PathVariable Integer appointmentId,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer cursorId) {

        AppointmentImageListResponse response = appointmentImageService.getImages(appointmentId, size, cursorId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEARCH_SUCCESS, response));
    }


    @Operation(summary = "장소 이름으로 장소 검색", description = "약속방 내에서 장소 이름으로 검색합니다.")
    @GetMapping("/places/search")
    public ResponseEntity<JSONResponse<PlaceSearchResponse>> searchPlaces(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer cursorId) {

        PlaceSearchResponse response = appointmentPlaceService.searchPlaces(keyword, size, cursorId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEARCH_SUCCESS, response));
    }


    @Operation(summary = "선택 장소 추가", description = "방장만 장소를 추가할 수 있습니다.")
    @PostMapping("/{appointmentId}/places/{placeId}")
    public ResponseEntity<JSONResponse<AddAppointmentPlaceResponse>> addPlaceToAppointment(
            @PathVariable Integer appointmentId,
            @PathVariable Integer placeId) {

        AddAppointmentPlaceResponse response = appointmentPlaceService.addPlaceToAppointment(appointmentId, placeId);
        return ResponseEntity
                .status(SuccessCode.PLACE_ADD_SUCCESS.getHttpStatus())
                .body(JSONResponse.of(SuccessCode.PLACE_ADD_SUCCESS, response));
    }


    @Operation(summary = "선택 장소 삭제", description = "방장만 장소를 삭제할 수 있습니다.")
    @DeleteMapping("/{appointmentId}/places/{appointmentPlaceId}")
    public ResponseEntity<JSONResponse<Void>> deletePlaceFromAppointment(
            @PathVariable Integer appointmentId,
            @PathVariable Integer appointmentPlaceId) {

        appointmentPlaceService.deletePlaceFromAppointment(appointmentId, appointmentPlaceId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.APPOINTMENT_PLACE_DELETE_SUCCESS));
    }

    @Operation(summary = "선택된 장소 리스트 조회", description = "약속에서 선택된 장소 목록을 조회합니다.")
    @GetMapping("/{appointmentId}/places")
    public ResponseEntity<JSONResponse<AppointmentPlaceListResponse>> getAppointmentPlaces(
            @PathVariable Integer appointmentId
    ) {
        AppointmentPlaceListResponse response = appointmentPlaceService.getAppointmentPlaces(appointmentId);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.SEARCH_SUCCESS, response));
    }


    @Operation(summary = "장소 순서 변경", description = "약속방 내 장소의 순서를 일괄 변경합니다.")
    @PutMapping("/{appointmentId}/places/order")
    public ResponseEntity<JSONResponse<AppointmentPlaceOrderUpdateResponse>> updatePlaceOrder(
            @PathVariable Integer appointmentId,
            @RequestBody @Valid AppointmentPlaceOrderUpdateRequest request
    ) {
        AppointmentPlaceOrderUpdateResponse response = appointmentPlaceService.updatePlaceOrder(appointmentId, request);
        return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, response));
    }
}
