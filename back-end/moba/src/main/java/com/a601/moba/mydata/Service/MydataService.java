package com.a601.moba.mydata.Service;

import com.a601.moba.auth.Service.JwtProvider;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.mydata.Controller.Response.MydataBase;
import com.a601.moba.mydata.Controller.Response.ReadMydataResponse;
import com.a601.moba.mydata.Exception.MydataException;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
    private final MydataRedisService mydataRedisService;
    private final MemberRepository memberRepository;

    @Value("${moba.mydata.base.url}")
    private String MYDATA_URL;

    public ReadMydataResponse read() {
        Member member = authUtil.getCurrentMember();

        // mydata용 access token이 있을 때
        if (member.getMydataToken() != null) {
            // 그 access token이 정상 작동할 때
            if (jwtProvider.isTokenValid(member.getMydataToken())) {
                return callMydataInfo(member);
            }
            // access token이 만료 됐을 때
            else {
                throw new MydataException(ErrorCode.MYDATA_ACCESS_FAILED);
            }
        }

        // access token이 아예 없을 때
        String status = mydataRedisService.getSmsVerificationStatus(member.getId());
        // access token이 없고 sms 인증 안했을 때
        if (!"VERIFIED".equals(status)) {
            throw new MydataException(ErrorCode.MYDATA_ACCESS_FAILED);
        }
        // 문자 인증이 됐을 때
        ReadMydataResponse response = callMydataInit(member);
        member.updateMydataToken(response.accessToken());
        memberRepository.save(member);
        mydataRedisService.clearSmsVerificationStatus(member.getId());
        return response;
    }

    private ReadMydataResponse callMydataInfo(Member member) {

        String accessToken = member.getMydataToken();

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + accessToken);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<Map> response = restTemplate.exchange(
                MYDATA_URL + "/info",
                HttpMethod.GET,
                request,
                Map.class
        );

        Map<String, Object> result = (Map<String, Object>) response.getBody().get("result");
        if (result == null) {
            throw new MydataException(ErrorCode.MYDATA_RESULT_EMPTY);
        }
        return ReadMydataResponse.builder()
                .accessToken(null)
                .mydataBase(parseRecommendationResult(result))
                .build();
    }

    private ReadMydataResponse callMydataInit(Member member) {

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> request = Map.of("user_id", member.getId());

        String url = MYDATA_URL + "/init?user_id=" + member.getId();
        ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);

        Map<String, Object> body = (Map<String, Object>) response.getBody();
        if (body == null || !body.containsKey("access_token") || !body.containsKey("result")) {
            throw new MydataException(ErrorCode.MYDATA_INIT_FAILED);
        }
        String accessToken = (String) body.get("access_token");
        Map<String, Object> result = (Map<String, Object>) body.get("result");

        MydataBase data = parseRecommendationResult(result);

        return new ReadMydataResponse(accessToken, data);
    }

    private MydataBase parseRecommendationResult(Map<String, Object> result) {
        // 추천 리스트
        List<Map<String, Object>> recList = (List<Map<String, Object>>) result.get("recommendations");
        Map<String, Double> subcategoryConsumption = recList.stream()
                .collect(Collectors.toMap(
                        m -> (String) m.get("소분류"),
                        m -> ((Number) m.get("score")).doubleValue()
                ));

        // 시간별 소비 금액
        Map<String, Integer> hourlyStats = (Map<String, Integer>) result.get("hourly_stats");

        // 페르소나 요약
        String personaSummary = (String) result.get("persona_summary");

        // 대분류 별 소분류 - 금액
        Map<String, Map<String, Double>> categoryPriceRatio =
                (Map<String, Map<String, Double>>) result.get("category_price_ratio");

        // 대분류 별 소분류 - 횟수
        Map<String, Map<String, Double>> categoryCountRatio =
                (Map<String, Map<String, Double>>) result.get("category_count_ratio");

        return MydataBase.builder()
                .subcategoryConsumption(subcategoryConsumption)
                .hourlyStats(hourlyStats)
                .personaSummary(personaSummary)
                .categoryPriceRatio(categoryPriceRatio)
                .categoryCountRatio(categoryCountRatio)
                .build();
    }


    public void sendCode(String phoneNumber) {
        Member member = authUtil.getCurrentMember();

        Random random = new Random();
        String code = String.valueOf(100000 + random.nextInt(900000));

        smsUtil.sendOne(phoneNumber, code);
        log.info("🟢 SMS 인증 코드 발송");

        mydataRedisService.saveCode(member.getEmail(), code);
    }

    public void verifyCode(String code) {
        Member member = authUtil.getCurrentMember();
        String savedCode = mydataRedisService.getCode(member.getEmail());
        log.info("@@@@@@@@@@@@@@@" + savedCode);
        if (!savedCode.equals(code)) {
            throw new MydataException(ErrorCode.INVALID_SMS_CODE);
        }
        mydataRedisService.setSmsVerificationStatus(member.getId(), "VERIFIED");
        mydataRedisService.deleteCode(member.getEmail());

        log.info("🟢 SMS 인증 성공 -> 상태 저장됨");
    }
}
