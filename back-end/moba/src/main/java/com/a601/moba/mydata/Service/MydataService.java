package com.a601.moba.mydata.Service;

import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.global.response.JSONResponse;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.mydata.Controller.Response.ReadMydataResponse;
import com.a601.moba.mydata.Controller.Response.ReadMydataWithTokenResponse;
import com.a601.moba.mydata.Exception.MydataException;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class MydataService {
    private final AuthUtil authUtil;
    private final JwtProvider jwtProvider;
    private final SmsUtil smsUtil;
    private final MypageRedisService mypageRedisService;

    @Value("${moba.mydata.base.url}")
    private String MYDATA_URL;

    public ReadMydataResponse read() {
        Member member = authUtil.getCurrentMember();

        if (member.getMydataToken() == null || !jwtProvider.isTokenValid(member.getMydataToken())) {
            throw new MydataException(ErrorCode.MYDATA_ACCESS_FAILED);
        }

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> requestData = new HashMap<>();
        requestData.put("accessToken", member.getMydataToken());
        requestData.put("id", member.getId());

        ResponseEntity<JSONResponse> response = restTemplate.postForEntity(
                MYDATA_URL + "/search", requestData, JSONResponse.class
        );
        Map<String, Object> result = (Map<String, Object>) response.getBody().result();

        return ReadMydataResponse.builder().build();
    }

    public void sendCode(String phoneNumber) {
        Member member = authUtil.getCurrentMember();

        Random random = new Random();
        String code = String.valueOf(100000 + random.nextInt(900000));

        smsUtil.sendOne(phoneNumber, code);
        log.info("🟢 SMS 인증 코드 발송");

        mypageRedisService.saveCode(member.getEmail(), code);
    }

    public ReadMydataWithTokenResponse auth(String code) {
        Member member = authUtil.getCurrentMember();

        if (!code.equals(mypageRedisService.getCode(member.getEmail()))) {
            throw new MydataException(ErrorCode.INVALID_SMS_CODE);
        }

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> requestData = new HashMap<>();
        requestData.put("accessToken", member.getMydataToken());
        requestData.put("id", member.getId());

        ResponseEntity<JSONResponse> response = restTemplate.postForEntity(
                MYDATA_URL + "/search", requestData, JSONResponse.class
        );
        Map<String, Object> result = (Map<String, Object>) response.getBody().result();

        return ReadMydataWithTokenResponse.builder().build();
    }
}
