package com.a601.moba.global.config;

import com.a601.moba.auth.Exception.JwtAccessDeniedHandler;
import com.a601.moba.auth.Exception.JwtAuthenticationEntryPoint;
import com.a601.moba.auth.Filter.JwtAuthenticationFilter;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.auth.Service.RedisService;
import com.a601.moba.global.filter.NotFoundPreFilter;
import java.util.Arrays;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
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

        NotFoundPreFilter notFoundPreFilter = new NotFoundPreFilter(handlerMappings);
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtProvider, redisService);

        http
                .cors(Customizer.withDefaults()) // CORS 설정 활성화
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/swagger-ui/index.html",
                                        "/v3/api-docs/**",
                                        "/swagger-resources/",
                                        "/webjars/"
                                ).permitAll()
                                .requestMatchers("/api/auth/signin").permitAll()
                                .requestMatchers("/api/auth/signup").permitAll()
                                .requestMatchers("/api/auth/kakao/callback").permitAll()
//                        .requestMatchers("/api/auth/social/kakao").permitAll()
                                .requestMatchers("/api/emails/send").permitAll()
                                .requestMatchers("/api/emails/verify").permitAll()
                                .requestMatchers("/api/members/password/reset").permitAll()
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

    // CORS설정
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("*")); // 모든 Origin 허용
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(false); // 중요: credentials 허용 불가 when origin is "*"

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
