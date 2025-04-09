import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function ConsentScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff', padding: 20 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-end' }}>
        <Feather name="x" size={24} color={Colors.text} />
      </TouchableOpacity>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginTop: 16 }}>
        마이데이터 연결
      </Text>
      <Text style={{ marginVertical: 12, color: Colors.gray }}>
        마이데이터 연결로 내 소비 패턴을 분석해보세요!
      </Text>

      <Text style={{ fontWeight: 'bold', marginTop: 20, marginBottom: 6 }}>
        [필수] 마이데이터 서비스 동의 약관
      </Text>
      <View style={{
        borderWidth: 1,
        borderColor: Colors.border,
        padding: 12,
        borderRadius: 8,
        backgroundColor: Colors.background,
      }}>
        <Text style={{ fontSize: 12 }}>
          개인정보 수집 항목 및 목적, 수집 방식 등에 대한 설명이 들어갑니다...
        </Text>
      </View>

      <TouchableOpacity
        style={{
          marginTop: 24,
          backgroundColor: Colors.primary,
          padding: 14,
          borderRadius: 12,
          alignItems: 'center',
        }}
        onPress={() => router.push('/wallet/analysis/selectBank')}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>
          동의하고 마이데이터 연결하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
