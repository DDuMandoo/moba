import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import axiosInstance from '@/app/axiosInstance';

const banks = [
  { name: '마이뱅크', logo: require('@/assets/icons/banks/mybank.png') },
  { name: '신한은행', logo: require('@/assets/icons/banks/shinhan.png') },
  { name: '국민은행', logo: require('@/assets/icons/banks/kb.png') },
  { name: '우리은행', logo: require('@/assets/icons/banks/woori.png') },
  { name: '하나은행', logo: require('@/assets/icons/banks/hana.png') },
  { name: '카카오뱅크', logo: require('@/assets/icons/banks/kakao.png') },
  { name: '농협은행', logo: require('@/assets/icons/banks/nh.png') },
  { name: '토스뱅크', logo: require('@/assets/icons/banks/toss.png') },
  { name: '케이뱅크', logo: require('@/assets/icons/banks/kbank.png') },
];

export default function SelectBankScreen() {
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [codeInputs, setCodeInputs] = useState(Array(6).fill(''));
  const [hasRequestedSms, setHasRequestedSms] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  useEffect(() => {
    if (timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const toggleBank = (name: string) => {
    setSelectedBanks((prev) =>
      prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
    );
  };

  const toggleAll = () => {
    if (selectedBanks.length === banks.length) {
      setSelectedBanks([]);
    } else {
      setSelectedBanks(banks.map((b) => b.name));
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    const updated = [...codeInputs];
    updated[index] = value;
    setCodeInputs(updated);

    if (value.length === 1 && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (value.length === 0 && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendSms = async () => {
    if (!phoneNumber) {
      Alert.alert('입력 오류', '전화번호를 입력해주세요.');
      return;
    }

    try {
      const res = await axiosInstance.post('/mydatas/send', { phoneNumber });
      console.log('✅ SMS 전송 성공:', res.data);
      Alert.alert('인증번호 전송됨', '입력하신 번호로 인증번호가 전송되었습니다.');
      setTimeLeft(600);
      setHasRequestedSms(true);
    } catch (error: any) {
      console.error('❌ SMS 전송 실패:', error?.response?.data || error);
      Alert.alert('전송 실패', error?.response?.data?.message ?? '인증번호 전송에 실패했습니다.');
    }
  };

  const handleSubmitAuth = async () => {
    const fullCode = codeInputs.join('');

    if (fullCode.length !== 6) {
      Alert.alert('입력 오류', '인증번호 6자리를 정확히 입력해주세요.');
      return;
    }

    try {
      const res = await axiosInstance.post('/mydatas/auth', {
        code: fullCode,
      });

      console.log('✅ 인증 성공:', res.data);
      setShowModal(false);
      Alert.alert('인증 완료', 'SMS 인증이 완료되었습니다!');
    } catch (error: any) {
      console.error('❌ 인증 실패:', error?.response?.data || error);
      Alert.alert('인증 실패', error?.response?.data?.message ?? '인증에 실패했습니다.');
    }
  };

  const isAllSelected = selectedBanks.length === banks.length;
  const isDisabled = selectedBanks.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#f6f5f3' }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold' }}>연결할 금융사 선택</Text>
          <Text style={{ marginTop: 8, color: Colors.grayDarkText }}>
            선택한 금융사에서 모든 계좌를 모아볼 수 있어요.
          </Text>
        </View>

        <View
          style={{
            backgroundColor: Colors.white,
            marginHorizontal: 20,
            borderRadius: 12,
            paddingVertical: 8,
          }}
        >
          <TouchableOpacity
            onPress={toggleAll}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 16,
            }}
          >
            <Text>한번에 연결하기</Text>
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                borderWidth: 1,
                backgroundColor: isAllSelected ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isAllSelected && <Ionicons name="checkmark" size={16} color="white" />}
            </View>
          </TouchableOpacity>

          {banks.map((bank, idx) => {
            const isChecked = selectedBanks.includes(bank.name);
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => toggleBank(bank.name)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 16,
                  borderTopWidth: idx === 0 ? 0 : 1,
                  borderColor: Colors.grayBackground,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image source={bank.logo} style={{ width: 24, height: 24, marginRight: 12 }} />
                  <Text>{bank.name}</Text>
                </View>
                <View
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    borderWidth: 1,
                    backgroundColor: isChecked ? Colors.primary : Colors.white,
                    borderColor: Colors.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {isChecked && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        disabled={isDisabled}
        style={{
          position: 'absolute',
          left: 20,
          right: 20,
          bottom: 30,
          backgroundColor: isDisabled ? Colors.gray200 : Colors.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
        }}
        onPress={() => {
          setShowModal(true);
        }}
      >
        <Text
          style={{
            color: isDisabled ? Colors.grayDarkText : '#fff',
            fontWeight: 'bold',
            fontSize: 16,
          }}
        >
          인증하기
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="none"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.3)',
            justifyContent: 'center',
            padding: 24,
          }}
        >
          <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 20 }}>
            <TouchableOpacity
              style={{ alignSelf: 'flex-end' }}
              onPress={() => setShowModal(false)}
            >
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>

            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>SMS 인증</Text>
            <Text style={{ marginVertical: 8, color: Colors.grayDarkText }}>
              휴대폰으로 전송된 인증번호를 입력해주세요.
            </Text>

            <Text style={{ marginTop: 16 }}>전화번호 입력</Text>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: Colors.primary,
                borderRadius: 8,
                paddingHorizontal: 12,
                marginVertical: 8,
              }}
            >
              <TextInput
                placeholder="010-1234-5678"
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={{ flex: 1, paddingVertical: 10 }}
              />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: Colors.grayBackground,
                }}
                onPress={handleSendSms}
              >
                <Text style={{ color: Colors.grayDarkText, fontWeight: 'bold' }}>확인</Text>
              </TouchableOpacity>
            </View>

            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}
            >
              {Array.from({ length: 6 }).map((_, idx) => (
                <TextInput
                  key={idx}
                  maxLength={1}
                  keyboardType="numeric"
                  value={codeInputs[idx]}
                  onChangeText={(val) => handleCodeChange(idx, val)}
                  style={{
                    width: 40,
                    height: 40,
                    borderWidth: 1,
                    borderColor: Colors.grayBackground,
                    borderRadius: 8,
                    textAlign: 'center',
                    fontSize: 18,
                  }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text>남은 시간: {formatTime(timeLeft)}</Text>
              <TouchableOpacity onPress={handleSendSms}>
                <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>인증번호 재전송</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={handleSubmitAuth}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>인증하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}