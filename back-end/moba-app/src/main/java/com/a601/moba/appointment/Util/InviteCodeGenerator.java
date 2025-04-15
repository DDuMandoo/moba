package com.a601.moba.appointment.Util;

import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class InviteCodeGenerator {

    public Optional<String> generate() {
        try {
            return Optional.of(UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}