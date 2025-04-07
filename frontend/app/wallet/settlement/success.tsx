import { View, Text, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { Button } from '@/components/ui/Button';
import PromiseCard from '@/components/promises/PromiseCard';
import axiosInstance from '@/app/axiosInstance';
import { AntDesign } from '@expo/vector-icons'; // ✅ 여기로 변경

interface DutchpayDetail {
  dutchpayId: number;
  appointmentId: number;
  appointmentName: string;
  appointmentImage: string | null;
  time: string;
  price: number;
  isCompleted: boolean;
}

export default function SettlementSuccessPage() {
  const { dutchpayId } = useLocalSearchParams<{ dutchpayId: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<DutchpayDetail | null>(null);

  const fetchData = async () => {
    try {
      const { data } = await axiosInstance.get(`/dutchpays/${dutchpayId}/receipt`);
      setInfo(data.result);
    } catch (err) {
      console.error('[❌ 정산 데이터 불러오기 실패]', err);
      Alert.alert('오류', '정산 데이터를 불러오지 못했어요.');
      router.back();
    }
  };

  useEffect(() => {
    if (dutchpayId) fetchData();
  }, [dutchpayId]);

  if (!info) return null;

  return (
    <View style={styles.container}>
      <View style={styles.centerBox}>
        <AntDesign name="checkcircle" size={96} color={Colors.primary} />
        <Text style={styles.successText}>정산 완료</Text>
        <Text style={styles.subText}>정산이 완료되었습니다.</Text>
      </View>

      <PromiseCard
        appointmentId={info.appointmentId}
        title={info.appointmentName}
        imageUrl={info.appointmentImage}
        time={info.time}
        amount={info.price}
      />

      <View style={styles.footer}>
        <Button.Large title="확인" onPress={() => router.replace('/wallet/settlement/success')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.grayBackground,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: 'space-between',
  },
  centerBox: {
    alignItems: 'center',
    marginTop: 40,
  },
  successText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: Colors.text,
  },
  footer: {
    marginBottom: 20,
  },
});
