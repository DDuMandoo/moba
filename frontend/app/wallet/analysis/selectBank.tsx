import { View, Text, TouchableOpacity, ScrollView, Image, Modal, TextInput } from 'react-native';
import { useEffect, useState } from 'react';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons'; // check 아이콘

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
  const [timeLeft, setTimeLeft] = useState(600); // 10분

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60).toString().padStart(2, '0');
    const sec = (seconds % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // 타이머
  useEffect(() => {
    if (!showModal) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal]);

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

  const isAllSelected = selectedBanks.length === banks.length;
  const isDisabled = selectedBanks.length === 0;


  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f6f5f3' }}>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: 'bold' }}>연결할 금융사 선택</Text>
        <Text style={{ marginTop: 8, color: Colors.grayDarkText }}>
          선택한 금융사에서 모든 계좌를 모아볼 수 있어요.
        </Text>
      </View>

      <View style={{
        backgroundColor: Colors.white,
        marginHorizontal: 20,
        borderRadius: 12,
        paddingVertical: 8,
      }}>
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
          <View style={{
            width: 20, height: 20, borderRadius: 4, borderWidth: 1,
            backgroundColor: isAllSelected ? Colors.primary : Colors.white,
            borderColor: Colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {isAllSelected && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
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
              <View style={{
                width: 20, height: 20, borderRadius: 4, borderWidth: 1,
                backgroundColor: isChecked ? Colors.primary : Colors.white,
                borderColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {isChecked && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        disabled={isDisabled}
        style={{
          margin: 20,
          backgroundColor: isDisabled ? Colors.gray200 : Colors.primary,
          padding: 16,
          borderRadius: 12,
          alignItems: 'center',
        }}
        onPress={() => {
          console.log('선택된 은행:', selectedBanks);
          setShowModal(true)
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

      {/* SMS 인증 모달 */}
      <Modal
        visible={showModal}
        animationType="none"
        transparent
        onRequestClose={() => setShowModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
          justifyContent: 'center',
          padding: 24,
        }}>
          <View style={{
            backgroundColor: 'white',
            borderRadius: 16,
            padding: 20,
          }}>
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
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: Colors.primary,
              borderRadius: 8,
              paddingHorizontal: 12,
              marginVertical: 8,
            }}>
              <TextInput
                placeholder="010-1234-5678"
                keyboardType="phone-pad"
                style={{ flex: 1, paddingVertical: 10 }}
              />
              <TouchableOpacity
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 6,
                  backgroundColor: Colors.grayBackground,
                }}
                onPress={() => {
                  // 중복 확인 로직 (추후 추가 가능)
                  console.log('전화번호 중복 확인');
                }}
              >
                <Text style={{ color: Colors.grayDarkText, fontWeight: 'bold' }}>중복확인</Text>
              </TouchableOpacity>
            </View>

            {/* 인증코드 입력 6자리 */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
              {Array.from({ length: 6 }).map((_, idx) => (
                <TextInput
                  key={idx}
                  maxLength={1}
                  keyboardType="numeric"
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
              <TouchableOpacity onPress={() => {
                // 재전송 처리
                console.log('인증번호 재전송');
                setTimeLeft(600); // 시간 초기화
              }}>
                <Text style={{ color: Colors.primary, fontWeight: 'bold' }}>
                  인증번호 재전송
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                padding: 14,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={() => {
                setShowModal(false);
                // 추가 로직 넣기! 후후후
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>인증하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
