import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { getBankMeta } from '@/constants/banks';
import axiosInstance from '@/app/axiosInstance';
import { setAccountList } from '@/redux/slices/accountSlice';

export default function AccountPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { list: accounts } = useAppSelector((state) => state.account);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  const fetchAccounts = async () => {
    try {
      const res = await axiosInstance.get('/wallets/account');
      dispatch(setAccountList(res.data.accounts));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.grayBackground, paddingHorizontal: 20 }}
      contentContainerStyle={{ paddingVertical: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{ marginBottom: 16 }}>
        <Text style={styles.title}>계좌 관리</Text>
        <Text style={styles.subtitle}>연결된 계좌들을 확인해보세요.</Text>
      </View>

      <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
        <Pressable onPress={() => router.push('/wallet/account/add')} style={styles.connectButton}>
          <Text style={styles.connectButtonText}>계좌연결</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        {loading ? (
          <View style={styles.feedbackBox}>
            <ActivityIndicator color={Colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.errorText}>계좌 정보를 불러올 수 없습니다.</Text>
          </View>
        ) : accounts.length === 0 ? (
          <View style={styles.feedbackBox}>
            <Text style={styles.emptyText}>연결된 계좌가 없습니다.</Text>
          </View>
        ) : (
          accounts.map((acc, index) => {
            const bank = getBankMeta(acc.type);
            const isLast = index === accounts.length - 1;
            return (
              <View
                key={`${acc.type}-${acc.account}`}
                style={[styles.accountItem, !isLast && styles.accountItemDivider]}
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
