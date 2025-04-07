import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { Button } from '@/components/ui/Button';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getBankMeta } from '@/constants/banks';
import axiosInstance from '@/app/axiosInstance';

export default function AccountConnectedCompletePage() {
  const router = useRouter();
  const { bank, account } = useLocalSearchParams<{
    bank: string;
    account: string;
  }>();
  const { width } = useWindowDimensions();

  const bankMeta = getBankMeta(bank || '');

  const handleConfirm = useCallback(async () => {
    try {
      const res = await axiosInstance.get('/wallets/account');
      const accountList = res.data?.result?.accounts ?? [];

      const isFirstAccount =
        accountList.length === 1 && accountList[0].account === account;

      if (isFirstAccount) {
        router.replace('/wallet/pin');
      } else {
        router.replace('/wallet/account');
      }
    } catch (error) {
      console.error('계좌 목록 확인 실패:', error);
      Alert.alert('오류', '계좌 정보를 확인할 수 없습니다.');
    }
  }, [account, router]);

  return (
    <View style={styles.container}>
      <Feather
        name="check-circle"
        size={80}
        color={Colors.primary}
        style={styles.icon}
      />
      <Text style={styles.title}>계좌 연결이 완료되었습니다</Text>

      <View style={[styles.card, { width: width * 0.9 }]}>
        <InfoRow label="은행" value={bankMeta.name} />
        <InfoRow label="계좌번호" value={account || '-'} />
      </View>

      <Text style={styles.description}>
        연결된 계좌로 서비스 이용 시 결제가 진행됩니다.
      </Text>

      <View style={styles.buttonContainer}>
        <Button.Large title="확인" onPress={handleConfirm} />
      </View>
    </View>
  );
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grayBackground,
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 32,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.grayDarkText,
  },
  value: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  description: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: Colors.grayDarkText,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 40,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
});
