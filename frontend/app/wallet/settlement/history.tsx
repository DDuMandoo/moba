import { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import PromiseCard from '@/components/promises/PromiseCard';
import Colors from '@/constants/Colors';
import { useRouter } from 'expo-router';
import axios from '@/app/axiosInstance';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { fetchWalletBalance } from '@/redux/slices/walletSlice';

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
  const dispatch = useAppDispatch();
  const balanceRaw = useAppSelector((state) => state.wallet.balance);
  const balance = Number(balanceRaw ?? 0);
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [showNotEnoughModal, setShowNotEnoughModal] = useState(false);

  useEffect(() => {
    dispatch(fetchWalletBalance());
  }, [dispatch]);

  const fetchHistory = async () => {
    try {
      const { data } = await axios.get('/dutchpays/receipt');
      const mapped = data.result.map((item: any) => {
        const participantList = item.participants ?? [];
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
      setHistoryList(mapped);
    } catch (e: any) {
      Alert.alert('불러오기 실패', '정산 내역을 가져오지 못했어요.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.grayBackground }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          정산 내역
        </Text>

        <View style={{ gap: 1 }}>
          {historyList.map((item) => {
            const amount = Number(item.amount ?? 0);
            return (
              <PromiseCard
                key={item.dutchpayId}
                title={item.title}
                imageUrl={item.imageUrl}
                time={item.time}
                amount={item.amount}
                appointmentId={item.appointmentId}
                onPress={() => {
                  if (balance < amount) {
                    setShowNotEnoughModal(true);
                    return;
                  }
                  router.push({
                    pathname: '/wallet/settlement/send/[id]',
                    params: {
                      id: String(item.appointmentId),
                      dutchpayId: String(item.dutchpayId),
                    },
                  });
                }}
              />
            );
          })}
        </View>
      </ScrollView>

      <Modal visible={showNotEnoughModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              width: '80%',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
              금액이 모자랍니다!
            </Text>
            <Text style={{ fontSize: 14, color: Colors.text, textAlign: 'center', marginBottom: 20 }}>
              지갑을 채워주세요!
            </Text>
            <TouchableOpacity
              onPress={() => setShowNotEnoughModal(false)}
              style={{
                backgroundColor: Colors.primary,
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
