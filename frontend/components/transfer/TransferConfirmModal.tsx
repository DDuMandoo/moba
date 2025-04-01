import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
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

export default function TransferConfirmModal({ onClose }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  const { selectedAccountId, list: accounts } = useAppSelector((state) => state.account);
  const amount = useAppSelector((state) => state.charge.amount);
  const balance = useAppSelector((state) => state.wallet.balance);

  const [isLoading, setIsLoading] = useState(true);

  const selectedAccount = accounts.find(
    (acc) => `${acc.type}-${acc.account}` === selectedAccountId
  );
  console.log('🧾 선택된 계좌 ID:', selectedAccountId);
  console.log('📄 계좌 목록:', accounts);
  console.log('🔍 선택된 계좌:', selectedAccount);

  const accountNumber = selectedAccount?.account || '';
  const bankMeta = getBankMeta(selectedAccount?.type || '');

  useEffect(() => {
    const transfer = async () => {
      try {
        const me = await axiosInstance.get('/members');
        const myId = me.data.result.memberId;
        console.log('✅ 내 ID:', myId);

        await axiosInstance.post('/wallets/transfer', {
          memberId: myId,
          amount,
        });
      } catch (err) {
        console.error('❌ 송금 실패:', err);
      } finally {
        setIsLoading(false);
      }
    };

    transfer();
  }, []);

  useEffect(() => {
    console.log('💡 useSelector로 받아온 balance:', balance);
  }, [balance]);

  if (!selectedAccountId || !selectedAccount) {
    return (
      <View style={styles.overlay}>
        <Text style={styles.amountText}>⚠️ 선택된 계좌 정보를 불러올 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.overlay}>
      <View
        style={[
          styles.modalBox,
          {
            width: width * 0.85,
            paddingVertical: height * 0.035,
            paddingHorizontal: width * 0.06,
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
              {amount.toLocaleString()}원을 송금했어요
            </Text>

            <View style={{ marginTop: 24, width: '100%' }}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>송금 계좌</Text>
                <View style={styles.accountInfo}>
                  <Image source={bankMeta.logo} style={styles.bankLogo} />
                  <Text style={styles.accountText}>
                    {bankMeta.name} {accountNumber}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>거래 후 잔액</Text>
                <Text style={styles.amountText}>{balance.toLocaleString()}원</Text>
              </View>
            </View>

            <View style={{ marginTop: height * 0.04 }}>
              <Button.Medium
                title="확인"
                onPress={async () => {
                  await dispatch(fetchWalletBalance());
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
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.text,
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
});