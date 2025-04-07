package com.a601.moba.dutch.Service;

import com.a601.moba.appointment.Entity.Appointment;
import com.a601.moba.appointment.Exception.AppointmentException;
import com.a601.moba.appointment.Repository.AppointmentRepository;
import com.a601.moba.auth.Exception.AuthException;
import com.a601.moba.auth.Util.AuthUtil;
import com.a601.moba.dutch.Controller.Request.CreateDutchpayRequest.Participant;
import com.a601.moba.dutch.Controller.Response.CompleteDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.CreateDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.GetDemandDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.GetReceiptDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.OcrDutchpayResponse;
import com.a601.moba.dutch.Controller.Response.TransferDutchpayResponse;
import com.a601.moba.dutch.Entity.Dutchpay;
import com.a601.moba.dutch.Entity.DutchpayParticipant;
import com.a601.moba.dutch.Entity.DutchpayParticipantId;
import com.a601.moba.dutch.Exception.DutchpayException;
import com.a601.moba.dutch.Repository.DutchpayParticipantRepository;
import com.a601.moba.dutch.Repository.DutchpayRepository;
import com.a601.moba.dutch.Service.Dto.ClovaOcrRequest;
import com.a601.moba.dutch.Service.Dto.FindDutchpayWithParticipantsDto;
import com.a601.moba.dutch.Service.Dto.FindReceiptsByWalletDto;
import com.a601.moba.dutch.Service.Dto.MultipartInputStreamFileResource;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.notification.Service.NotificationService;
import com.a601.moba.wallet.Entity.Transaction;
import com.a601.moba.wallet.Entity.TransactionStatus;
import com.a601.moba.wallet.Entity.TransactionType;
import com.a601.moba.wallet.Entity.Wallet;
import com.a601.moba.wallet.Exception.WalletAuthException;
import com.a601.moba.wallet.Repository.TransactionRepository;
import com.a601.moba.wallet.Repository.WalletRepository;
import com.a601.moba.wallet.Service.WalletService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.firebase.messaging.FirebaseMessagingException;
import jakarta.transaction.Transactional;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class DutchpayService {

    private final MemberRepository memberRepository;
    private final AppointmentRepository appointmentRepository;
    private final WalletRepository walletRepository;
    private final TransactionRepository transactionRepository;
    private final DutchpayParticipantRepository dutchpayParticipantRepository;
    private final DutchpayRepository dutchpayRepository;
    private final AuthUtil authUtil;
    private final WalletService walletService;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Value("${clova.ocr.url}")
    private String apiUrl;

    @Value("${clova.ocr.secret}")
    private String secretKey;

    @Value("${gpt.api.key}")
    private String gptApiKey;

    public Member getMemberByEmail(String email) {
        return memberRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException(ErrorCode.MEMBER_NOT_FOUND));
    }

    public Member getMemberById(Integer id) {
        return memberRepository.findById(id)
                .orElseThrow(() -> new AuthException(ErrorCode.MEMBER_NOT_FOUND));
    }

    public Appointment getAppointmentById(Integer id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new AppointmentException(ErrorCode.APPOINTMENT_NOT_FOUND));
    }

    public Wallet getWalletByMemberId(Integer id) {
        return walletRepository.findByMemberId(id)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_WALLET));
    }

    public Dutchpay getDutchpayById(Integer id) {
        return dutchpayRepository.findById(id)
                .orElseThrow(() -> new DutchpayException(ErrorCode.NOT_FOUND_DUTCHPAY));
    }

    @Transactional
    public CreateDutchpayResponse create(Integer appointmentId, Long totalPrice,
                                         List<Participant> participants) {
        Member host = authUtil.getCurrentMember();
        Appointment appointment = getAppointmentById(appointmentId);
        Wallet hostWallet = getWalletByMemberId(host.getId());

        if (participants.size() == 1 && Objects.equals(participants.get(0).memberId(), host.getId())) {
            throw new DutchpayException(ErrorCode.FAILED_CREATE_DUTCHPAY);
        }

        Dutchpay dutchpay = dutchpayRepository.save(Dutchpay.builder()
                .appointment(appointment)
                .host(host)
                .price(totalPrice)
                .build());

        Map<Integer, Long> sumParticipants = new HashMap<>();
        Long sumPrice = 0L;
        for (Participant p : participants) {
            sumParticipants.put(p.memberId(), sumParticipants.getOrDefault(p.memberId(), 0L) + p.price());
            sumPrice += p.price();
        }

        if (!Objects.equals(totalPrice, sumPrice)) {
            throw new DutchpayException(ErrorCode.NOT_MATCH_PRICE);
        }

        log.info("🟢 더치 페이 금액 일치");

        List<CreateDutchpayResponse.Participant> participantResponse = new ArrayList<>();
        for (Entry<Integer, Long> participant : sumParticipants.entrySet()) {
            if (Objects.equals(participant.getKey(), host.getId())) {
                dutchpay.updateSettlement(participant.getValue());
                participantResponse.add(createParticipantResponse(host, true, participant.getValue()));
                continue;
            }
            Member member = getMemberById(participant.getKey());
            Wallet wallet = getWalletByMemberId(participant.getKey());

            Transaction depositTransaction = createTransaction(hostWallet, wallet, participant.getValue(),
                    TransactionType.D);
            Transaction withdrawTransaction = createTransaction(wallet, hostWallet, participant.getValue(),
                    TransactionType.W);

            DutchpayParticipant dutchpayParticipant = createParticipant(depositTransaction, withdrawTransaction, wallet,
                    participant.getValue(), dutchpay, false);

            try {
                notificationService.sendSettlementStarted(host, member, appointment.getName(), sumPrice,
                        sumParticipants.size(), participant.getValue(), dutchpay.getId());
            } catch (FirebaseMessagingException e) {
                log.error("🔴 FCM 알림 정송 실패");
            }

            participantResponse.add(createParticipantResponse(member, false, participant.getValue()));
        }

        log.info("🟢 더치페이 생성 완료");

        return CreateDutchpayResponse.builder()
                .dutchpayId(dutchpay.getId())
                .appointmentId(appointment.getId())
                .appointmentName(appointment.getName())
                .hostId(host.getId())
                .hostName(host.getName())
                .hostImage(host.getProfileImage())
                .totalPrice(totalPrice)
                .createdAt(dutchpay.getCreatedAt())
                .participants(participantResponse)
                .build();
    }

    private Transaction createTransaction(Wallet wallet, Wallet target, Long amount, TransactionType type) {
        return transactionRepository.save(Transaction.builder()
                .wallet(wallet)
                .target(target)
                .amount(amount)
                .type(type)
                .status(TransactionStatus.PENDING)
                .build());
    }

    public DutchpayParticipant createParticipant(Transaction depositTransaction, Transaction withdrawTransaction,
                                                 Wallet wallet,
                                                 Long price, Dutchpay dutchpay, boolean status) {
        return dutchpayParticipantRepository.save(DutchpayParticipant.builder()
                .dutchpay(dutchpay)
                .wallet(wallet)
                .price(price)
                .depositTransaction(depositTransaction)
                .withdrawTransaction(withdrawTransaction)
                .status(status)
                .build());
    }

    public CreateDutchpayResponse.Participant createParticipantResponse(Member member, boolean status, Long price) {
        return CreateDutchpayResponse.Participant.builder()
                .memberId(member.getId())
                .memberName(member.getName())
                .memberImage(member.getProfileImage())
                .status(status)
                .price(price)
                .build();
    }

    @Transactional
    public CompleteDutchpayResponse complete(Integer dutchpayId, Integer participantId) {
        Dutchpay dutchpay = getDutchpayById(dutchpayId);
        Member member = authUtil.getCurrentMember();
        if (!Objects.equals(dutchpay.getHost().getId(), member.getId())) {
            throw new DutchpayException(ErrorCode.INVALID_HOST);
        }
        Member participant = getMemberById(participantId);
        Wallet participantWallet = getWalletByMemberId(participantId);

        DutchpayParticipant dutchpayParticipant = dutchpayParticipantRepository.findById(
                        new DutchpayParticipantId(dutchpay, participantWallet))
                .orElseThrow(() -> new DutchpayException(ErrorCode.NOT_FOUND_DUTCHPAY_PARTICIPANT));

        if (dutchpayParticipant.isStatus()) {
            throw new DutchpayException(ErrorCode.ALREADY_COMPLETE_DUTCHPAY);
        }

        dutchpayParticipant.setFailedTransaction();
        log.info("🟢 거래 내역 취소 완료");

        boolean isCompleted = dutchpay.updateSettlement(dutchpayParticipant.getPrice());

        dutchpayParticipant.updateStatus(true);
        log.info("🟢 참여자 완료 처리 status : {}", dutchpayParticipant.isStatus());

        return CompleteDutchpayResponse.builder()
                .MemberId(participant.getId())
                .MemberName(participant.getName())
                .MemberImage(participant.getProfileImage())
                .isCompleted(isCompleted)
                .build();
    }

    @Transactional
    public TransferDutchpayResponse transfer(Integer dutchpayId) {
        Dutchpay dutchpay = getDutchpayById(dutchpayId);
        Member member = authUtil.getCurrentMember();
        Wallet wallet = walletRepository.getByMemberForUpdate(member)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_WALLET));

        Member host = dutchpay.getHost();
        Wallet hostWallet = walletRepository.getByMemberForUpdate(host)
                .orElseThrow(() -> new WalletAuthException(ErrorCode.INVALID_WALLET));

        DutchpayParticipant dutchpayParticipant = dutchpayParticipantRepository.findById(
                        new DutchpayParticipantId(dutchpay, wallet))
                .orElseThrow(() -> new DutchpayException(ErrorCode.NOT_FOUND_DUTCHPAY_PARTICIPANT));

        walletService.dutchpayTransfer(wallet, hostWallet, dutchpayParticipant.getWithdrawTransaction(),
                dutchpayParticipant.getDepositTransaction(),
                dutchpayParticipant.getPrice());
        log.info("🟢 이체 완료");

        boolean isCompleted = dutchpay.updateSettlement(dutchpayParticipant.getPrice());
        Appointment appointment = dutchpay.getAppointment();
        if (isCompleted) {
            try {
                notificationService.sendSettlementCompleted(appointment.getName(), member, host, dutchpayId);
            } catch (Exception e) {
                throw new DutchpayException(ErrorCode.FCM_SEND_FAILED);
            }
        }

        return TransferDutchpayResponse.builder()
                .appointmentId(appointment.getId())
                .appointmentName(appointment.getName())
                .appointmentImage(appointment.getImage())
                .hostId(host.getId())
                .hostName(host.getName())
                .hostImage(host.getProfileImage())
                .isCompleted(isCompleted)
                .build();
    }

    public List<GetDemandDutchpayResponse> getDemands() {
        Member host = authUtil.getCurrentMember();

        List<FindDutchpayWithParticipantsDto> dutchpays = dutchpayRepository.findByHostWithParticipantsDTO(host);

        Map<Integer, GetDemandDutchpayResponse> groupedDutchpays = new HashMap<>();
        for (FindDutchpayWithParticipantsDto d : dutchpays) {
            GetDemandDutchpayResponse response = groupedDutchpays.computeIfAbsent(d.dutchpayId(),
                    id -> mapToDemandResponse(d));
            if (response.participants() != null) {
                response.participants().add(
                        GetDemandDutchpayResponse.Participant.builder()
                                .memberId(d.memberId())
                                .memberName(d.memberName())
                                .memberImage(d.memberImage())
                                .price(d.price())
                                .status(d.status())
                                .build()
                );
            }
        }

        return groupedDutchpays.values().stream()
                .sorted(Comparator.comparing(GetDemandDutchpayResponse::time).reversed())
                .collect(Collectors.toList());
    }

    public GetDemandDutchpayResponse getDemand(Integer dutchpayId) {
        List<FindDutchpayWithParticipantsDto> dutchpays = dutchpayRepository.findByIdWithParticipantsDTO(dutchpayId);

        GetDemandDutchpayResponse response = mapToDemandResponse(dutchpays.get(0));
        for (FindDutchpayWithParticipantsDto d : dutchpays) {
            response.participants().add(
                    GetDemandDutchpayResponse.Participant.builder()
                            .memberId(d.memberId())
                            .memberName(d.memberName())
                            .memberImage(d.memberImage())
                            .price(d.price())
                            .status(d.status())
                            .build()
            );
        }

        return response;
    }

    public GetDemandDutchpayResponse mapToDemandResponse(FindDutchpayWithParticipantsDto d) {
        return GetDemandDutchpayResponse.builder()
                .dutchpayId(d.dutchpayId())
                .appointmentId(d.appointmentId())
                .appointmentName(d.appointmentName())
                .appointmentImage(d.appointmentImage())
                .totalPrice(d.totalPrice())
                .settled(d.settlement())
                .isCompleted(d.isCompleted())
                .time(d.createdAt())
                .participants(new ArrayList<>())
                .build();
    }

    public List<GetReceiptDutchpayResponse> getReceipts() {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWalletByMemberId(member.getId());

        List<FindReceiptsByWalletDto> groupedReceipt = dutchpayRepository.findReceiptsByWalletId(wallet.getId());

        return groupedReceipt.stream().map(this::mapToReceiptResponse)
                .sorted(Comparator.comparing(GetReceiptDutchpayResponse::time))
                .collect(Collectors.toList());
    }

    public GetReceiptDutchpayResponse getReceipt(Integer dutchpayId) {
        Member member = authUtil.getCurrentMember();
        Wallet wallet = getWalletByMemberId(member.getId());

        FindReceiptsByWalletDto receipt = dutchpayRepository.findReceiptsByWalletIdAndDutchpayId(wallet.getId(),
                dutchpayId);
        return mapToReceiptResponse(receipt);
    }

    public GetReceiptDutchpayResponse mapToReceiptResponse(FindReceiptsByWalletDto d) {
        return GetReceiptDutchpayResponse.builder()
                .dutchpayId(d.dutchpayId())
                .appointmentId(d.appointmentId())
                .appointmentName(d.appointmentName())
                .appointmentImage(d.appointmentImage())
                .hostId(d.hostId())
                .hostName(d.hostName())
                .hostImage(d.hostImage())
                .price(d.price())
                .isCompleted(d.status())
                .time(d.createdAt())
                .build();
    }

    public List<OcrDutchpayResponse> ocrAndAnalyzeReceipt(MultipartFile image) throws IOException {
        RestTemplate restTemplate = new RestTemplate();

        String fileName = image.getOriginalFilename();
        String format = fileName.substring(fileName.lastIndexOf('.') + 1);

        log.info("1. OCR 요청 본문 구성");
        // 1. OCR 요청 본문 구성
        String message = objectMapper.writeValueAsString(new ClovaOcrRequest(format, fileName));
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("message", message);
        body.add("file", new MultipartInputStreamFileResource(image.getInputStream(), fileName));

        log.info("2. OCR 헤더 설정");
        // 2. OCR 헤더 설정
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("X-OCR-SECRET", secretKey);

        log.info("3. OCR 요청 전송");
        // 3. OCR 요청 전송
        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, request, String.class);

        log.info("4. OCR 응답으로부터 텍스트 추출");
        // 4. OCR 응답으로부터 텍스트 추출
        String receiptText = extractAllText(objectMapper.readTree(response.getBody()));

        log.info("5. GPT 분석");
        // 5. GPT 분석
        return analyzeReceiptWithGpt(receiptText);
    }

    public List<OcrDutchpayResponse> analyzeReceiptWithGpt(String receiptText) throws IOException {
        RestTemplate restTemplate = new RestTemplate();

        log.info("1. GPT 프롬프트 구성");
        // 1. GPT 프롬프트 구성
        String prompt = """
                다음 영수증에서 품목 이름, 수량, 단가, 총액을 JSON 형식으로 뽑아줘.
                결과는 [{"item": "제품명", "quantity": 수량, "price": 단가, "total": 총액}] 형태로 반환해.
                
                """ + receiptText;

        ObjectNode userMessage = objectMapper.createObjectNode();
        userMessage.put("role", "user");
        userMessage.put("content", prompt);

        ObjectNode requestBody = objectMapper.createObjectNode();
        requestBody.put("model", "gpt-3.5-turbo");
        requestBody.set("messages", objectMapper.createArrayNode().add(userMessage));

        log.info("2. GPT 요청 헤더 구성");
        // 2. GPT 요청 헤더 구성
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(gptApiKey);

        HttpEntity<String> request = new HttpEntity<>(objectMapper.writeValueAsString(requestBody), headers);
        ResponseEntity<String> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions", request, String.class);

        log.info("3. GPT 응답 파싱");
        // 3. GPT 응답 파싱
        JsonNode root = objectMapper.readTree(response.getBody());
        String content = root.path("choices").get(0).path("message").path("content").asText();

        log.info("4. JSON 응답을 리스트로 변환");
        // 4. JSON 응답을 리스트로 변환
        List<OcrDutchpayResponse> result = new ArrayList<>();
        try {
            JsonNode itemsNode = objectMapper.readTree(content);
            for (JsonNode itemNode : itemsNode) {
                result.add(OcrDutchpayResponse.builder()
                        .item(itemNode.path("item").asText())
                        .quantity(itemNode.path("quantity").asInt())
                        .price(itemNode.path("price").asInt())
                        .total(itemNode.path("total").asInt())
                        .build());
            }
        } catch (Exception e) {
            throw new IOException("GPT 응답을 JSON으로 파싱할 수 없습니다: " + content, e);
        }

        return result;
    }

    public String extractAllText(JsonNode response) {
        StringBuilder result = new StringBuilder();
        JsonNode fields = response.path("images").get(0).path("fields");

        for (JsonNode field : fields) {
            result.append(field.path("inferText").asText()).append(" ");
        }

        return result.toString().trim();
    }
}
