import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Colors from '@/constants/Colors';

interface Transaction {
  name: string;
  image: string | null;
  payAt: string;
  amount: number;
  type: 'D' | 'W';
}

interface ApiResponse {
  result: {
    transactions: Transaction[];
    cursorId: number;
    cursorPayAt: string;
  };
}

const getTransactionEndpoint = (filter: 'ALL' | 'WITHDRAW' | 'DEPOSIT') => {
  switch (filter) {
    case 'WITHDRAW':
      return '/api/wallets/transaction/withdraw';
    case 'DEPOSIT':
      return '/api/wallets/transaction/deposit';
    default:
      return '/api/wallets/transaction';
  }
};

const fetchTransactions = async (filter: 'ALL' | 'WITHDRAW' | 'DEPOSIT'): Promise<Transaction[]> => {
  const endpoint = getTransactionEndpoint(filter);
  const res = await axios.get<ApiResponse>(endpoint, {
    headers: {
      Authorization: 'Bearer YOUR_ACCESS_TOKEN',
      'Content-Type': 'application/json',
    },
    params: {
      size: 50,
    },
  });

  return res.data.result.transactions || [];
};

export default function TransactionHistory() {
  const [filter, setFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAW'>('ALL');

  const { data: transactions = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['transactions', filter],
    queryFn: () => fetchTransactions(filter),
  });

  const formatDate = (datetime: string) => {
    const d = new Date(datetime);
    return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${d.getHours()}시 ${String(
      d.getMinutes()
    ).padStart(2, '0')}분`;
  };

  const formatAmount = (amt: number, type: 'D' | 'W') => {
    const sign = type === 'D' ? '+' : '-';
    return `${sign} ${amt.toLocaleString()}원`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 상단 설명 및 필터 */}
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Text style={styles.title}>내 지갑 세부 내역</Text>
          <Text style={styles.subtitle}>내가 보낸 돈과 받은 돈 내역을 확인할 수 있어요.</Text>
          <View style={styles.filterRow}>
            {['ALL', 'WITHDRAW', 'DEPOSIT'].map((key) => {
              const isActive = filter === key;
              const label = key === 'ALL' ? '전체' : key === 'WITHDRAW' ? '보낸 돈' : '받은 돈';
              const color = isActive ? Colors.black : Colors.grayDarkText;
              return (
                <TouchableOpacity key={key} onPress={() => setFilter(key as any)}>
                  <View style={styles.filterItem}>
                    <View style={[styles.dot, { backgroundColor: color }]} />
                    <Text style={[styles.filterText, { color }]}>{label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 리스트 */}
        <View style={{ paddingHorizontal: 20 }}>
          <View style={styles.whiteWrapper}>
            <View style={styles.whiteBox}>
              {transactions.length === 0 ? (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>거래 내역이 없습니다.</Text>
                </View>
              ) : (
                transactions.map((item, idx) => (
                  <View style={styles.itemBox} key={idx}>
                    <View style={styles.itemLeft}>
                      <Image
                        source={{
                          uri: item.image ?? 'https://placekitten.com/60/60',
                        }}
                        style={styles.avatar}
                      />
                      <View>
                        <Text style={styles.name}>{item.name}</Text>
                        <Text style={styles.date}>{formatDate(item.payAt)}</Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.amount,
                        item.type === 'D' ? styles.deposit : styles.withdraw,
                      ]}
                    >
                      {formatAmount(item.amount, item.type)}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // ... 기존과 동일
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayDarkText,
    marginBottom: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  filterItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 14,
    marginLeft: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 1,
  },
  whiteWrapper: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 32,
    minHeight: Dimensions.get('window').height * 0.7,
    paddingHorizontal: 20,
  },
  whiteBox: {
    flex: 1,
  },
  itemBox: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.black,
  },
  date: {
    fontSize: 12,
    color: Colors.grayDarkText,
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deposit: {
    color: Colors.primary,
  },
  withdraw: {
    color: Colors.black,
  },
  emptyBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.grayDarkText,
  },
});
