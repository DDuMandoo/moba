package com.a601.moba.global.config;

import com.a601.moba.global.filter.NotFoundPreFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration corsConfiguration = new CorsConfiguration();
        corsConfiguration.addAllowedOrigin("*"); // 모든 도메인 허용, 특정 도메인만 허용하려면 "*" 대신 "http://example.com" 사용
        corsConfiguration.addAllowedMethod("*"); // 모든 HTTP 메서드 허용
        corsConfiguration.addAllowedHeader("*"); // 모든 헤더 허용

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", corsConfiguration); // 모든 엔드포인트에 대해 CORS 설정

        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   List<HandlerMapping> handlerMappings) throws Exception {

        NotFoundPreFilter notFoundPreFilter = new NotFoundPreFilter(handlerMappings);

        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))  // CORS 설정을 명시적으로 제공
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/**").permitAll() // 모든 API 엔드포인트를 허용
                        .anyRequest().authenticated()      // 나머지 요청은 인증 필요
                )
                // Filter 추가
                .addFilterBefore(notFoundPreFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

