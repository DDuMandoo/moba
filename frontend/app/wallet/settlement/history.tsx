import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import PromiseCard from '@/components/promises/PromiseCard';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import axios from '@/app/axiosInstance';

interface HistoryItem {
  dutchpayId: number;
  appointmentId: number;
  title: string;
  imageUrl: string;
  time: string;
  amount: number;
  settled: number;
  participants: string[];
}

export default function SettlementHistoryPage() {
  const router = useRouter();
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);

  const fetchHistory = async () => {
    try {
      console.log('[📤 API 요청 시작] /dutchpays/receipt');

      const { data } = await axios.get('/dutchpays/receipt');

      console.log('[✅ 정산 내역 응답 전체]', JSON.stringify(data, null, 2));

      if (!data.result || data.result.length === 0) {
        console.log('[⚠️ 응답은 성공했지만 result가 비어 있음]');
      }

      const mapped = data.result.map((item: any, index: number) => {
        const participantList = item.participants ?? [];
      
        console.log(`[🔍 항목 ${index + 1}]`, {
          dutchpayId: item.dutchpayId,
          appointmentId: item.appointmentId,
          title: item.appointmentName,
          time: item.time,
          amount: item.price,
          settled: item.settled,
          participantsCount: participantList.length,
        });
      
        return {
          dutchpayId: item.dutchpayId,
          appointmentId: item.appointmentId,
          title: item.appointmentName,
          imageUrl: item.appointmentImage,
          time: item.time,
          amount: item.price,
          settled: item.settled,
          participants: participantList.map((p: any) => p.memberImage ?? ''),
        };
      });

      console.log('[📦 최종 매핑된 데이터]', mapped);
      setHistoryList(mapped);
    } catch (e: any) {
      console.log('[❌ 정산 내역 에러]', e);

      if (e.response) {
        console.log('[❌ 서버 응답 에러]', JSON.stringify(e.response.data, null, 2));
      }

      Alert.alert('불러오기 실패', '정산 내역을 가져오지 못했어요.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.grayBackground }}
      contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
    >
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        정산 내역
      </Text>

      <View style={{ gap: 1 }}>
        {historyList.map((item) => (
          <PromiseCard
          key={item.dutchpayId}
          title={item.title}
          imageUrl={item.imageUrl}
          time={item.time}
          amount={item.amount}
          appointmentId={item.appointmentId}
          onPress={() =>
            router.push({
              pathname: '/wallet/settlement/send/[id]',
              params: { 
                id: String(item.appointmentId),
                dutchpayId: String(item.dutchpayId),
              },
            })
          }
        />
        ))}
      </View>
    </ScrollView>
  );
}
