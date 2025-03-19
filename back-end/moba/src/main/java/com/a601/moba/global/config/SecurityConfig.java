package com.a601.moba.global.config;

import com.a601.moba.auth.Exception.JwtAccessDeniedHandler;
import com.a601.moba.auth.Exception.JwtAuthenticationEntryPoint;
import com.a601.moba.auth.Filter.JwtAuthenticationFilter;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.auth.Service.RedisService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtProvider jwtProvider,
                                                   RedisService redisService,
                                                   JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                                                   JwtAccessDeniedHandler jwtAccessDeniedHandler) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/members/signin").permitAll()
                        .requestMatchers("/api/members/signup").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint) // 401 Unauthorized 발생 시 처리
                        .accessDeniedHandler(jwtAccessDeniedHandler) // 403 Forbidden 발생 시 처리
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtProvider, redisService), UsernamePasswordAuthenticationFilter.class);


        return http.build();
    }
}
