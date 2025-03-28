import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getBankMeta } from '@/constants/banks';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';

const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN';

interface Account {
  account: string;
  type: string;
  isMain: boolean;
  createdAt: string;
}

const fetchAccounts = async (): Promise<Account[]> => {
  const res = await axios.get('/wallets/account', {
    headers: {
      'Content-Type': 'application/json',
      Authorization: ACCESS_TOKEN,
    },
  });
  return res.data.accounts;
};

export default function AccountPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: fetchAccounts,
  });

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: Colors.grayBackground,
        paddingHorizontal: 20,
      }}
      contentContainerStyle={{ paddingVertical: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 타이틀 */}
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.title}>계좌 관리</Text>
        <Text style={styles.subtitle}>연결된 계좌들을 확인해보세요.</Text>
      </View>

      {/* 계좌연결 버튼 */}
      <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
        <Pressable
          onPress={() => router.push('/wallet/account/add')}
          style={styles.connectButton}
        >
          <Text style={styles.connectButtonText}>계좌연결</Text>
        </Pressable>
      </View>

      {/* 카드 영역 */}
      <View style={styles.card}>
        {isLoading ? (
          <View style={styles.feedbackBox}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.errorText}>계좌 정보를 불러올 수 없습니다.</Text>
          </View>
        ) : data && data.length === 0 ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.emptyText}>연결된 계좌가 없습니다.</Text>
          </View>
        ) : (
          data.map((acc, index) => {
            const bank = getBankMeta(acc.type);
            const isLast = index === data.length - 1;

            return (
              <View
                key={`${acc.type}-${acc.account}`}
                style={[
                  styles.accountItem,
                  !isLast && styles.accountItemDivider,
                ]}
              >
                <Image source={bank.logo} style={styles.bankIcon} />
                <View>
                  <Text style={styles.bankName}>{bank.name}</Text>
                  <Text style={styles.accountNumber}>{acc.account}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  connectButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  connectButtonText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  feedbackBox: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  accountItemDivider: {
    borderBottomWidth: 1,
    borderColor: Colors.grayLightText,
  },
  bankIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  accountNumber: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  errorText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.grayDarkText,
    textAlign: 'center',
  },
});
