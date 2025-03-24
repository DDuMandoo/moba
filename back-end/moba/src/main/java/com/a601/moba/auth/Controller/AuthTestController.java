package com.a601.moba.auth.Controller;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/auth/test")
public class AuthTestController {

    @GetMapping("/kakao/callback")
    public void kakaoCallback(@RequestParam String code, HttpServletResponse response) throws Exception {
        log.info("카카오 인가 코드: {}", code);

        // 인가 코드를 로그에 출력하고 간단한 메시지 반환
        response.setContentType("text/plain");
        response.getWriter().write("✅ 카카오 인가 코드: " + code);
    }
}
