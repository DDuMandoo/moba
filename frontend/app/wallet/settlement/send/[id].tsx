import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Colors from '@/constants/Colors';
import axiosInstance from '@/app/axiosInstance';

export default function SettlementPinPage() {
  const router = useRouter();
  const { dutchpayId } = useLocalSearchParams<{ dutchpayId: string }>();

  const [pin, setPin] = useState<string[]>([]);
  const [hostName, setHostName] = useState('');
  const [hostImage, setHostImage] = useState<string | null>(null);
  const [price, setPrice] = useState<number>(0);
  

  // ✅ 정산 정보 불러오기
  useEffect(() => {
    console.log('[🧪 쿼리 파라미터]', dutchpayId);
    
    const fetchInfo = async () => {
      try {
        const { data } = await axiosInstance.get(`/dutchpays/${dutchpayId}/receipt`);
        console.log('[📦 정산 데이터 응답]', JSON.stringify(data, null, 2)); // 👈 꼭 찍기
        const info = data.result;
  
        // 임시 fallback 처리
        setHostName(info.hostName ?? '(이름 없음)');
        setHostImage(info.hostImage ?? null);
        setPrice(info.price ?? 0);
      } catch (err) {
        console.log('[❌ 정산 정보 에러]', err);
        Alert.alert('오류', '정산 정보를 불러오지 못했어요.');
        router.back();
      }
    };
    if (dutchpayId) fetchInfo();
  }, [dutchpayId]);

  useEffect(() => {
    if (pin.length === 6) {
      const password = pin.join('');
  
      setTimeout(async () => {
        try {
          console.log('[🔐 입력된 비밀번호]', password);
          
          const authRes = await axiosInstance.post('/wallets/auth', { password });
          console.log('[✅ 비밀번호 인증 응답]', JSON.stringify(authRes.data, null, 2));
  
          if (authRes.data.isSuccess) {
            // ✅ 정산 PATCH 요청
            console.log('[📦 PATCH 요청 시작]', `/dutchpays/${dutchpayId}/transfer`);
  
            try {
              const transferRes = await axiosInstance.patch(`/dutchpays/${dutchpayId}/transfer`);
              console.log('[✅ 정산 완료 처리 응답]', JSON.stringify(transferRes.data, null, 2));
  
              if (transferRes.data.isSuccess) {
                router.replace({
                  pathname: '/wallet/settlement/success',
                  params: { dutchpayId }, // 쿼리 파라미터 같이 넘기기
                });
              } else {
                Alert.alert('실패', '정산 완료 처리에 실패했습니다.');
              }
            } catch (err: any) {
              console.error('[❌ 정산 완료 처리 에러]', err);
  
              if (err.response) {
                console.log('[📛 에러 응답]', JSON.stringify(err.response.data, null, 2));
                Alert.alert('에러', err.response.data.message ?? '정산 완료 중 오류가 발생했어요.');
              } else {
                Alert.alert('에러', '정산 완료 중 알 수 없는 오류가 발생했어요.');
              }
            }
  
          } else {
            throw new Error('비밀번호 인증 실패');
          }
        } catch (err) {
          console.log('[❌ 비밀번호 인증 실패]', err);
          Alert.alert('비밀번호가 틀렸습니다.');
          setPin([]);
        }
      }, 200);
    }
  }, [pin]);
  

  const handlePress = (digit: string) => {
    if (pin.length < 6) {
      setPin((prev) => [...prev, digit]);
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileBox}>
        <Image
          source={
            hostImage
              ? { uri: hostImage }
              : require('@/assets/images/defaultprofile.png')
          }
          style={styles.profileImage}
        />
        <Text style={styles.nameText}>{hostName} 님에게</Text>
        <Text style={styles.amountText}>{price.toLocaleString()}원</Text>
        <Text style={styles.instructionText}>
          이체하시려면 비밀번호를 입력해주세요.
        </Text>
      </View>

      {/* 🔢 핀 입력 UI */}
      <View style={styles.pinContainer}>
        <View style={styles.pinRow}>
          {Array.from({ length: 6 }).map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: pin[i] ? '#ccc' : '#eee' }]}
            />
          ))}
        </View>
      </View>

      {/* 🔘 숫자 키패드 */}
      <View style={styles.keypadWrapper}>
        {[['1','2','3'], ['4','5','6'], ['7','8','9'], ['','0','⌫']].map((row, rIdx) => (
          <View key={rIdx} style={styles.keypadRow}>
            {row.map((val, cIdx) => {
              if (val === '') return <View key={cIdx} style={{ width: 72 }} />;
              if (val === '⌫') {
                return (
                  <TouchableOpacity key={cIdx} style={styles.keypadButton} onPress={handleDelete}>
                    <Text style={styles.keypadText}>⌫</Text>
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity key={cIdx} style={styles.keypadButton} onPress={() => handlePress(val)}>
                  <Text style={styles.keypadText}>{val}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3F2',
    paddingTop: 40,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
  },
  amountText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginVertical: 4,
  },
  instructionText: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  pinContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 20,
    width: '75%',
    alignItems: 'center',
  },
  pinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#eee',
  },
  keypadWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
  },
  keypadButton: {
    width: 65,
    height: 65,
    borderRadius: 36,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonEmpty: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'transparent',
  },
  keypadText: {
    fontSize: 28,
    color: Colors.primary,
  },
});