import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from '@/app/axiosInstance';
import { Button } from '@/components/ui/Button';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { Feather } from '@expo/vector-icons';


interface Participant {
  memberId: number;
  memberName: string;
  memberImage: string | null;
  price: number;
}

export default function CompletedPage() {
  const { id: appointmentId, dutchpayId } = useLocalSearchParams<{
    id: string;
    dutchpayId: string;
  }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const fetchDutchpayInfo = async () => {
    try {
      console.log('[GET 요청 시작]', dutchpayId); // ✅ dutchpayId가 유효한지 먼저 로그
  
      const { data } = await axios.get(`/dutchpays/${dutchpayId}/demand`);
  
      console.log('[GET 응답 데이터]', data); // ✅ 서버가 준 응답 전체 확인
      console.log('[응답 result]', data.result); // ✅ 핵심 정보 잘 나오는지 확인
      console.log('[응답 participants]', data.result.participants); // ✅ 배열인지 null인지 확인
  
      // 정상 처리
      setTotalPrice(data.result.totalPrice);
      setParticipants(data.result.participants);
    } catch (error: any) {
      console.log('[GET 에러]', error);
  
      if (error.response) {
        console.log('[GET 에러 응답]', error.response.data);
      }
  
      Alert.alert('불러오기 실패', '정산 정보를 가져오지 못했어요.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dutchpayId) {
      fetchDutchpayInfo();
    }
  }, [dutchpayId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Feather name="check-circle" size={80} color={Colors.primary} style={styles.icon} />


      {/* 텍스트 */}
      <Text style={styles.title}>정산 요청 완료</Text>
      <Text style={styles.subtitle}>참가자들에게 정산 요청이 전송되었습니다.</Text>

      {/* 금액 & 참여자 목록 */}
      <View style={styles.summaryBox}>
        <Text style={styles.totalText}>
          총 {totalPrice.toLocaleString()}원 (2차)
        </Text>

        {participants.map((p) => (
          <View key={p.memberId} style={styles.personRow}>
            <View style={styles.profileWrapper}>
              <Image
                source={
                  p.memberImage
                    ? { uri: p.memberImage }
                    : require('@/assets/images/defaultprofile.png')
                }
                style={styles.profileImage}
              />
              <Text style={styles.name}>{p.memberName}</Text>
            </View>
            <Text style={styles.amount}>{p.price.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* 버튼 */}
      <View style={styles.buttonWrapper}>
        <Button.Large title="확인" onPress={() => router.replace('/(bottom-navigation)')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F0EE',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: Colors.grayDarkText,
    marginBottom: 32,
  },
  summaryBox: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    width: '100%',
    padding: 20,
    marginBottom: 36,
  },
  totalText: {
    fontSize: 18,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    marginBottom: 20,
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  name: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  amount: {
    fontSize: 15,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  buttonWrapper: {
    width: '100%',
    paddingBottom: 20,
  },
});
