package com.a601.moba.global.config;

import com.a601.moba.auth.Exception.JwtAccessDeniedHandler;
import com.a601.moba.auth.Exception.JwtAuthenticationEntryPoint;
import com.a601.moba.auth.Filter.JwtAuthenticationFilter;
import com.a601.moba.auth.Service.AuthRedisService;
import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.global.config.properties.CorsProperties;
import com.a601.moba.global.filter.NotFoundPreFilter;
import com.a601.moba.member.Repository.MemberRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(CorsProperties.class)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtProvider jwtProvider,
                                                   AuthRedisService redisService,
                                                   JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
                                                   JwtAccessDeniedHandler jwtAccessDeniedHandler,
                                                   MemberRepository memberRepository,
                                                   List<HandlerMapping> handlerMappings) throws Exception {

        NotFoundPreFilter notFoundPreFilter = new NotFoundPreFilter(handlerMappings);
        JwtAuthenticationFilter jwtAuthenticationFilter = new JwtAuthenticationFilter(jwtProvider, redisService,
                memberRepository);

        http
                .cors(Customizer.withDefaults()) // CORS 설정 활성화
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                                .requestMatchers(
                                        "/swagger-ui/**",
                                        "/swagger-ui.html",
                                        "/swagger-ui/index.html",
                                        "/v3/api-docs/**",
                                        "/swagger-resources/**",
                                        "/webjars/**"
                                ).permitAll()
                                .requestMatchers("/api/auth/signin").permitAll()
                                .requestMatchers("/api/auth/signup").permitAll()
                                .requestMatchers("/api/auth/*/profile-image").permitAll()
                                .requestMatchers("/api/auth/email").permitAll()
                                .requestMatchers("/api/auth/kakao/callback").permitAll()
                                .requestMatchers("/api/ws/**").permitAll()
                                .requestMatchers("/api/chat.send").permitAll()
//                              .requestMatchers("/api/auth/social/kakao").permitAll()
                                .requestMatchers("/api/emails/send").permitAll()
                                .requestMatchers("/api/emails/verify").permitAll()
                                .requestMatchers("/api/members/password/reset").permitAll()
                                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
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
    private final CorsProperties corsProperties;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsProperties.getAllowedOrigins());
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
