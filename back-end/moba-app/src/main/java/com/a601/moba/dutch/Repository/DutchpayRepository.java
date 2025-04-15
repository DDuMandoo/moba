package com.a601.moba.dutch.Repository;

import com.a601.moba.dutch.Entity.Dutchpay;
import com.a601.moba.dutch.Service.Dto.FindDutchpayWithParticipantsDto;
import com.a601.moba.dutch.Service.Dto.FindReceiptsByWalletDto;
import com.a601.moba.member.Entity.Member;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DutchpayRepository extends JpaRepository<Dutchpay, Integer> {
    @Query("""
                SELECT new com.a601.moba.dutch.Service.Dto.FindDutchpayWithParticipantsDto(
                    d.id, 
                    a.id, 
                    a.name, 
                    a.image, 
                    d.price, 
                    d.settlement, 
                    d.isCompleted,
                    d.createdAt,
                    dp.id.wallet.member.id,
                    dp.id.wallet.member.name,
                    dp.id.wallet.member.profileImage,
                    dp.price,
                    dp.status
                )
                FROM Dutchpay d
                JOIN d.appointment a
                LEFT JOIN DutchpayParticipant dp ON dp.id.dutchpay = d
                LEFT JOIN dp.id.wallet w
                WHERE d.host = :host
                AND d.isCompleted = false
                ORDER BY d.createdAt DESC
            """)
    List<FindDutchpayWithParticipantsDto> findByHostWithParticipantsDTO(@Param("host") Member host);

    @Query("""
                SELECT new com.a601.moba.dutch.Service.Dto.FindDutchpayWithParticipantsDto(
                    d.id, 
                    a.id, 
                    a.name, 
                    a.image, 
                    d.price, 
                    d.settlement, 
                    d.isCompleted,
                    d.createdAt,
                    dp.id.wallet.member.id,
                    dp.id.wallet.member.name,
                    dp.id.wallet.member.profileImage,
                    dp.price,
                    dp.status
                )
                FROM Dutchpay d
                JOIN d.appointment a
                LEFT JOIN DutchpayParticipant dp ON dp.id.dutchpay = d
                LEFT JOIN dp.id.wallet w
                WHERE d.id = :id
            """)
    List<FindDutchpayWithParticipantsDto> findByIdWithParticipantsDTO(@Param("id") Integer id);

    @Query("""
                SELECT new com.a601.moba.dutch.Service.Dto.FindReceiptsByWalletDto(
                    d.id,
                    d.appointment.id,
                    d.appointment.name,
                    d.appointment.image,
                    h.id,
                    h.name,
                    h.profileImage,
                    dp.price,
                    dp.status,
                    d.createdAt
                )
                FROM DutchpayParticipant dp
                JOIN dp.id.dutchpay d
                JOIN d.host h
                WHERE dp.id.wallet.id = :walletId
                AND dp.status = false
                ORDER BY d.createdAt ASC
            """)
    List<FindReceiptsByWalletDto> findReceiptsByWalletId(@Param("walletId") Integer walletId);

    @Query("""
                SELECT new com.a601.moba.dutch.Service.Dto.FindReceiptsByWalletDto(
                    d.id,
                    d.appointment.id,
                    d.appointment.name,
                    d.appointment.image,
                    h.id,
                    h.name,
                    h.profileImage,
                    dp.price,
                    dp.status,
                    d.createdAt
                )
                FROM DutchpayParticipant dp
                JOIN dp.id.dutchpay d
                JOIN d.host h
                WHERE dp.id.wallet.id = :walletId
                AND dp.id.dutchpay.id = :dutchpayId
            """)
    FindReceiptsByWalletDto findReceiptsByWalletIdAndDutchpayId(@Param("walletId") Integer walletId,
                                                                @Param("dutchpayId") Integer dutchpayId);
}
