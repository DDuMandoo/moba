package com.a601.moba.global.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class FCMConfig {

//    @Value("${spring.firebase.path}")
//    private String credentialsPath;
//
//    // FirebaseMessaging 인스턴스를 생성하는 메서드
//    @Bean
//    public FirebaseMessaging firebaseMessaging() throws IOException {
//        try {
//            GoogleCredentials credentials = GoogleCredentials // firebase-credentials.json 파일에서 인증 정보를 가져옴
//                    .fromStream(new FileInputStream(credentialsPath)); // 파일 위치는 resources 폴더 아래
//
//            // 이미 초기화되었는지 확인
//            // 초기화되지 않았다면 인증 정보를 이용해 FirebaseApp을 초기화
//            if (FirebaseApp.getApps().isEmpty()) {
//                FirebaseOptions options = FirebaseOptions.builder()
//                        .setCredentials(credentials)
//                        .build();
//                FirebaseApp.initializeApp(options);
//            }
//
//            // FirebaseMessaging 인스턴스를 반환 -> 해당 인스턴스를 이용해 FCM 메시지를 보낼 수 있음
//            return FirebaseMessaging.getInstance();
//        } catch (IOException e) {
//            throw new RuntimeException("Firebase 초기화 중 오류 발생", e);
//        }
//    }
}