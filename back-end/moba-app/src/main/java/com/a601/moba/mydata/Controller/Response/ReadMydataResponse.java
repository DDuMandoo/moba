package com.a601.moba.mydata.Controller.Response;

import lombok.Builder;

@Builder
public record ReadMydataResponse(
        String accessToken,
        MydataBase mydataBase

) {
}
