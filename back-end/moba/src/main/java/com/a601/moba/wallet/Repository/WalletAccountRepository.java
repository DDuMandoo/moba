package com.a601.moba.wallet.Repository;

import com.a601.moba.wallet.Entity.Wallet;
import com.a601.moba.wallet.Entity.WalletAccount;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletAccountRepository extends JpaRepository<WalletAccount, Integer> {
    Optional<WalletAccount> getWalletAccountByWalletAndIsMainTrue(Wallet wallet);

    Optional<WalletAccount> getWalletAccountByAccountAndWallet(String account, Wallet wallet);

    Optional<WalletAccount> getWalletAccountByAccount(String account);

    List<WalletAccount> getAllByWallet(Wallet wallet);

    boolean existsByAccount(String account);
}
