package com.a601.moba.appointment.Exception;

import com.a601.moba.global.response.JSONResponse;
import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Hidden
@RestControllerAdvice
public class AppointmentExceptionHandler {

    @ExceptionHandler(AppointmentException.class)
    public ResponseEntity<JSONResponse<Void>> handleAppointmentException(AppointmentException e) {
        return ResponseEntity
                .status(e.getErrorCode().getHttpStatus())
                .body(JSONResponse.onFailure(e.getErrorCode()));
    }
}
