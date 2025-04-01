import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchWalletBalance } from '@/redux/slices/walletSlice';
import axiosInstance from '@/app/axiosInstance';
import { getBankMeta } from '@/constants/banks';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'expo-router';


interface Props {
  onClose: () => void;
}

export default function ChargeConfirmModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { selectedAccountId, list: accounts } = useAppSelector((state) => state.account);
  const amount = useAppSelector((state) => state.charge.amount);
  const balance = useAppSelector((state) => state.wallet.balance);

  const [isLoading, setIsLoading] = useState(true);
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();

  const selectedAccount = accounts.find(
    (acc) => `${acc.type}-${acc.account}` === selectedAccountId
  );
  const accountNumber = selectedAccount?.account || '';
  const bankMeta = getBankMeta(selectedAccount?.type || '');
  const formattedAmount = amount.toLocaleString('ko-KR');
  const formattedBalance = balance.toLocaleString('ko-KR');

  useEffect(() => {
    const charge = async () => {
      if (!accountNumber || !amount) {
        console.warn('❌ 충전 실패 - account 또는 amount 없음', { accountNumber, amount });
        setIsLoading(false);
        return;
      }

      try {
        console.log('🚀 [ChargeConfirmModal] 충전 요청 전송:', {
          account: accountNumber,
          amount,
        });

        const res = await axiosInstance.post('/wallets/deposit', {
          account: accountNumber,
          amount,
        });

        console.log('✅ [ChargeConfirmModal] 충전 성공:', res.data);
        await dispatch(fetchWalletBalance());
        console.log('🔄 지갑 잔액 갱신 완료');
      } catch (err) {
        console.error('❌ [ChargeConfirmModal] 충전 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    charge();
  }, []);

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.modalBox,
          {
            width: screenWidth * 0.85,
            paddingVertical: screenHeight * 0.035,
            paddingHorizontal: screenWidth * 0.06,
          },
        ]}
      >
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Feather name="x" size={24} color={Colors.black} />
        </TouchableOpacity>

        {isLoading ? (
          <ActivityIndicator size="large" color={Colors.primary} />
        ) : (
          <View style={styles.contentBox}>
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <Feather name="check-circle" size={48} color={Colors.primary} />
            </View>

            <Text style={styles.title}>
              {formattedAmount}원을{'\n'}충전 완료 했어요
            </Text>

            <View style={{ marginTop: 24, width: '100%' }}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>충전계좌</Text>
                <View style={styles.accountInfo}>
                  <Image source={bankMeta.logo} style={styles.bankLogo} />
                  <Text style={styles.accountText}>
                    {bankMeta.name} {accountNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>거래 후 잔액</Text>
                <Text style={styles.amountText}>{formattedBalance}원</Text>
              </View>
            </View>

            <View style={{ marginTop: screenHeight * 0.04 }}>
              <Button.Medium 
                title="확인" 
                onPress={() => {
                  onClose();
                  router.replace('/(bottom-navigation)');
                }}
                />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  contentBox: {
    paddingTop: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    lineHeight: 28,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankLogo: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 4,
  },
  accountText: {
    fontSize: 14,
    
    color: Colors.text,
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
  },
});
