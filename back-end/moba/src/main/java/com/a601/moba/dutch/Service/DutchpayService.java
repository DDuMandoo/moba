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
import com.a601.moba.dutch.Controller.Response.TransferDutchpayResponse;
import com.a601.moba.dutch.Entity.Dutchpay;
import com.a601.moba.dutch.Entity.DutchpayParticipant;
import com.a601.moba.dutch.Entity.DutchpayParticipantId;
import com.a601.moba.dutch.Exception.DutchpayException;
import com.a601.moba.dutch.Repository.DutchpayParticipantRepository;
import com.a601.moba.dutch.Repository.DutchpayRepository;
import com.a601.moba.dutch.Service.Dto.FindDutchpayWithParticipantsDto;
import com.a601.moba.dutch.Service.Dto.FindReceiptsByWalletDto;
import com.a601.moba.global.code.ErrorCode;
import com.a601.moba.member.Entity.Member;
import com.a601.moba.member.Repository.MemberRepository;
import com.a601.moba.wallet.Entity.Transaction;
import com.a601.moba.wallet.Entity.TransactionStatus;
import com.a601.moba.wallet.Entity.TransactionType;
import com.a601.moba.wallet.Entity.Wallet;
import com.a601.moba.wallet.Exception.WalletAuthException;
import com.a601.moba.wallet.Repository.TransactionRepository;
import com.a601.moba.wallet.Repository.WalletRepository;
import com.a601.moba.wallet.Service.WalletService;
import jakarta.transaction.Transactional;
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
import org.springframework.stereotype.Service;

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

            createParticipant(depositTransaction, withdrawTransaction, wallet, participant.getValue(), dutchpay, false);

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

    public void createParticipant(Transaction depositTransaction, Transaction withdrawTransaction, Wallet wallet,
                                  Long price, Dutchpay dutchpay, boolean status) {
        dutchpayParticipantRepository.save(DutchpayParticipant.builder()
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
                dutchpay.getPrice());
        log.info("🟢 이체 완료");

        boolean isCompleted = dutchpay.updateSettlement(dutchpayParticipant.getPrice());

        Appointment appointment = dutchpay.getAppointment();

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
}
