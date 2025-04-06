package com.a601.moba.dutch.Service.Dto;

import java.util.Collections;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
@AllArgsConstructor
public class ClovaOcrRequest {
    private final Object images;
    private final String requestId = UUID.randomUUID().toString();
    private final String version = "V2";
    private final long timestamp = System.currentTimeMillis();

    public ClovaOcrRequest(String format, String name) {
        this.images = Collections.singletonList(new Image(format, name));
    }

    @Builder
    @Getter
    @AllArgsConstructor
    static class Image {
        private String format;
        private String name;
    }
}
