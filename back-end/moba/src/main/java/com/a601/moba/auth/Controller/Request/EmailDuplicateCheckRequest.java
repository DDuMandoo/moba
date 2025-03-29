package com.a601.moba.auth.Controller.Request;

import lombok.Builder;

@Builder
public record EmailDuplicateCheckRequest(String email) {
}
