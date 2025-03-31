package com.a601.moba.dutch.Controller;

import com.a601.moba.dutch.Controller.Request.CompleteDutchpayRequest;
import com.a601.moba.dutch.Controller.Request.CreateDutchpayRequest;
import com.a601.moba.dutch.Controller.Response.CompleteDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.CreateDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.TransferDutchpayResponse;
import com.a601.moba.dutch.Service.DutchpayService;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequiredArgsConstructor
@RequestMapping("/api/dutchpays")
public class DutchpayController {

    private final DutchpayService dutchpayService;

    @PostMapping
    public ResponseEntity<JSONResponse<CreateDutchpayResponse>> create(
            @RequestBody CreateDutchpayRequest request
    ) {
        CreateDutchpayResponse response = dutchpayService.create(
                request.appointmentId(),
                request.totalPrice(),
                request.participants());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.CREATE_DUTCHPAY_SUCCESS, response));
    }

    @PatchMapping("/{dutchpayId}/complete")
    public ResponseEntity<JSONResponse<CompleteDutchpayResponse>> complete(
            @PathVariable Integer dutchpayId,
            @RequestBody CompleteDutchpayRequest request
    ) {
        CompleteDutchpayResponse response = dutchpayService.complete(
                dutchpayId,
                request.participantId());

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.COMPLETE_DUTCHPAY_SUCCESS, response));
    }

    @PatchMapping("/{dutchpayId}/transfer")
    public ResponseEntity<JSONResponse<TransferDutchpayResponse>> transfer(
            @PathVariable Integer dutchpayId
    ) {
        TransferDutchpayResponse response = dutchpayService.transfer(dutchpayId);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.COMPLETE_DUTCHPAY_SUCCESS, response));
    }
}
