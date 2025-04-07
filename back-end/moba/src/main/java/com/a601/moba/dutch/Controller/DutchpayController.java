package com.a601.moba.dutch.Controller;

import com.a601.moba.dutch.Controller.Request.CompleteDutchpayRequest;
import com.a601.moba.dutch.Controller.Request.CreateDutchpayRequest;
import com.a601.moba.dutch.Controller.Response.CompleteDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.CreateDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.GetDemandDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.GetReceiptDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.OcrDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.TransferDutchpayResponse;
import com.a601.moba.dutch.Exception.DutchpayException;
import com.a601.moba.dutch.Service.DutchpayService;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.code.SuccessCode;
import com.a601.moba.global.response.JSONResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/demand")
    public ResponseEntity<JSONResponse<List<GetDemandDutchpayResponse>>> getDemands() {
        List<GetDemandDutchpayResponse> responses = dutchpayService.getDemands();

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.READ_DEMAND_DUTCHPAY_SUCCESS, responses));
    }

    @GetMapping("/{dutchpayId}/demand")
    public ResponseEntity<JSONResponse<GetDemandDutchpayResponse>> getDemand(
            @PathVariable Integer dutchpayId
    ) {
        GetDemandDutchpayResponse response = dutchpayService.getDemand(dutchpayId);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.READ_DEMAND_DUTCHPAY_SUCCESS, response));
    }

    @GetMapping("/receipt")
    public ResponseEntity<JSONResponse<List<GetReceiptDutchpayResponse>>> getReceipts() {
        List<GetReceiptDutchpayResponse> responses = dutchpayService.getReceipts();

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.READ_RECEIPT_DUTCHPAY_SUCCESS, responses));
    }

    @GetMapping("/{dutchpayId}/receipt")
    public ResponseEntity<JSONResponse<GetReceiptDutchpayResponse>> getReceipt(
            @PathVariable Integer dutchpayId
    ) {
        GetReceiptDutchpayResponse response = dutchpayService.getReceipt(dutchpayId);

        return ResponseEntity.ok(JSONResponse.of(SuccessCode.READ_RECEIPT_DUTCHPAY_SUCCESS, response));
    }

    @PostMapping("/ocr")
    public ResponseEntity<JSONResponse<List<OcrDutchpayResponse>>> ocr(
            @RequestParam(value = "image") MultipartFile image
    ) {
        try {
            List<OcrDutchpayResponse> result = dutchpayService.ocrAndAnalyzeReceipt(image);
            return ResponseEntity.ok(JSONResponse.of(SuccessCode.REQUEST_SUCCESS, result));
        } catch (Exception e) {
            log.error("OCR 및 GPT 분석 실패");
            throw new DutchpayException(ErrorCode.FAILED_OCR_IMAGE);
        }
    }
}
