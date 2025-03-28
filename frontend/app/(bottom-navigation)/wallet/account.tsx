import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { getBankMeta } from '@/constants/banks';
import { useRouter } from 'expo-router';

const ACCESS_TOKEN = 'YOUR_ACCESS_TOKEN'; // 실제론 secure storage 등에서 가져와야 함

interface Account {
  account: string;
  type: string;
  isMain: boolean;
  createdAt: string;
}

const fetchAccounts = async (): Promise<Account[]> => {
  const res = await axios.get('/api/wallets/account', {
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
      className="flex-1 bg-[#F5F3F1] px-5"
      contentContainerStyle={{ paddingVertical: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 제목 + 설명 */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-900">계좌 관리</Text>
        <Text className="text-sm text-gray-500 mt-1">
          연결된 계좌들을 확인해보세요.
        </Text>
      </View>

      {/* 계좌연결 버튼 */}
      <View className="items-end mb-4">
        <Pressable
          onPress={() => router.push('/wallet/account/add')}
          className="px-4 py-2 border border-[#593C1C] rounded-lg"
        >
          <Text className="text-[#593C1C] font-semibold text-sm">계좌연결</Text>
        </Pressable>
      </View>

      {/* 계좌 리스트 */}
      <View className="bg-white rounded-2xl px-4 py-2">
        {isLoading ? (
          <ActivityIndicator color="#593C1C" className="mt-6" />
        ) : isError ? (
          <Text className="text-red-500 mt-4">계좌 정보를 불러올 수 없습니다.</Text>
        ) : data && data.length === 0 ? (
          <Text className="text-gray-500 py-6 text-center">연결된 계좌가 없습니다.</Text>
        ) : (
          data?.map((acc, index) => {
            const bank = getBankMeta(acc.type);
            const isLast = index === data.length - 1;

            return (
              <View
                key={`${acc.type}-${acc.account}`}
                className="flex-row items-center py-3"
                style={{
                  borderBottomWidth: isLast ? 0 : 1,
                  borderColor: '#E6E4E3',
                }}
              >
                <Image
                  source={bank.logo}
                  style={{ width: 24, height: 24, marginRight: 12 }}
                  resizeMode="contain"
                />
                <View>
                  <Text className="text-base font-semibold text-gray-900">
                    {bank.name}
                  </Text>
                  <Text className="text-sm text-gray-700">{acc.account}</Text>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}
