import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { getBankMeta } from '@/constants/banks';
import { useAppSelector } from '@/redux/hooks';

interface Props {
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
}

export default function ChargeSourceList({
  selectedAccountId,
  onSelectAccount,
}: Props) {
  const router = useRouter();
  const accounts = useAppSelector((state) => state.account.list);
  const isLoading = false;
  const isError = false;

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>충전수단</Text>
        <TouchableOpacity
          onPress={() => router.push('/wallet/account/add')}
          style={styles.addButton}
        >
          <Text style={styles.addText}>계좌연결</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
      ) : isError ? (
        <Text style={{ color: 'red', marginTop: 16 }}>
          계좌를 불러올 수 없습니다.
        </Text>
      ) : !Array.isArray(accounts) || accounts.length === 0 ? (
        <Text
          style={{
            color: Colors.grayDarkText,
            paddingVertical: 24,
            textAlign: 'center',
          }}
        >
          연결된 계좌가 없습니다.
        </Text>
      ) : (
        accounts.map((acc, index) => {
          const bank = getBankMeta(acc.type);
          const fallbackId = `${acc.type}-${acc.account}`;
          const accountId = acc.id ?? fallbackId;
          const selected = accountId === selectedAccountId;
          const key = acc.id ?? `${acc.type}-${acc.account}-${index}`;

          return (
            <TouchableOpacity
              key={key}
              onPress={() => {
                console.log('✅ 계좌 선택됨:', accountId);
                onSelectAccount(accountId);
              }}
              style={[
                styles.accountRow,
                selected && { backgroundColor: Colors.grayBackground },
              ]}
            >
              <Image
                source={bank.logo}
                style={{ width: 24, height: 24, marginRight: 12 }}
                resizeMode="contain"
              />
              <View>
                <Text style={styles.bankName}>{bank.name}</Text>
                <Text style={styles.bankAccount}>{acc.account}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  addButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: '#E6E4E3',
  },
  bankName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  bankAccount: {
    fontSize: 13,
    color: Colors.grayDarkText,
  },
});
