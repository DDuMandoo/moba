package com.a601.moba.global.config;

import com.a601.moba.auth.Exception.JwtAccessDeniedHandler;
import com.a601.moba.auth.Exception.JwtAuthenticationEntryPoint;
import com.a601.moba.auth.Filter.JwtAuthenticationFilter;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.auth.Service.RedisService;
import com.a601.moba.global.filter.NotFoundPreFilter;
import java.util.List;
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

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtProvider jwtProvider,
                                                   RedisService redisService,
                                                   JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                                                   JwtAccessDeniedHandler jwtAccessDeniedHandler,
                                                   List<HandlerMapping> handlerMappings) throws Exception {

        // NotFoundPreFilter는 UsernamePasswordAuthenticationFilter보다 앞에 있어야 함
        NotFoundPreFilter notFoundPreFilter = new NotFoundPreFilter(handlerMappings);
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtProvider, redisService);

        http.csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/members/signin").permitAll()
                        .requestMatchers("/api/members/signup").permitAll()
                        .requestMatchers("/api/emails/send").permitAll()
                        .requestMatchers("/api/emails/verify").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(jwtAccessDeniedHandler)
                )
                // 주의: 클래스 순서가 아니라 Filter 객체 기준으로 등록
                .addFilterBefore(notFoundPreFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
