import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { BANKS, getBankMeta } from '@/constants/banks';
import { Ionicons } from '@expo/vector-icons';
import VerifyCodeModal from '@/components/account/AccountVerifyModal';
import axiosInstance from '@/app/axiosInstance';

export default function AccountAddPage() {
  const router = useRouter();
  const [selectedBank, setSelectedBank] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const currentBankMeta = getBankMeta(selectedBank);

  const handleConnect = async () => {
    if (!selectedBank || !accountNumber) return;

    const formattedAccount = accountNumber.trim(); // ✅ 하이픈 포함 그대로 사용

    try {
      console.log('📤 계좌 등록 요청:', {
        account: formattedAccount,
        bank: selectedBank,
      });

      await axiosInstance.post('/wallets/account', {
        account: formattedAccount,
        bank: selectedBank,
      });

      console.log('✅ 계좌 등록 성공, 인증 모달 오픈');
      setShowVerifyModal(true);
    } catch (error: any) {
      console.log('❌ 계좌 등록 실패:', error?.response?.data);
      Alert.alert('계좌 등록 실패', error?.response?.data?.message || '계좌 등록에 실패했습니다.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.grayBackground }}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>계좌 연결</Text>
      <Text style={styles.subtitle}>지갑에서 사용할 계좌를 선택하고 입력해주세요.</Text>

      {/* 은행 선택 */}
      <TouchableOpacity
        style={styles.dropdownTrigger}
        onPress={() => setDropdownOpen((prev) => !prev)}
        activeOpacity={0.9}
      >
        {selectedBank ? (
          <View style={styles.selectedBank}>
            <Image source={currentBankMeta.logo} style={styles.bankLogo} />
            <Text style={styles.bankName}>{currentBankMeta.name}</Text>
          </View>
        ) : (
          <Text style={styles.dropdownPlaceholder}>은행을 선택하세요</Text>
        )}
        <Ionicons
          name={dropdownOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={Colors.grayDarkText}
        />
      </TouchableOpacity>

      {dropdownOpen && (
        <View style={styles.dropdown}>
          {BANKS.map((bank) => (
            <TouchableOpacity
              key={bank.type}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedBank(bank.type);
                setDropdownOpen(false);
              }}
            >
              <Image source={bank.logo} style={styles.bankLogo} />
              <Text style={styles.bankName}>{bank.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 계좌 입력 */}
      <View style={{ marginTop: 24 }}>
        <Text style={styles.inputLabel}>계좌번호</Text>
        <TextInput
          style={styles.input}
          value={accountNumber}
          onChangeText={setAccountNumber}
          placeholder="예: 196-15404-392"
          keyboardType="default" // ✅ 숫자+하이픈 허용
          placeholderTextColor={Colors.grayLightText}
        />
      </View>

      {/* 인증하기 버튼 */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          !(selectedBank && accountNumber) && styles.submitBtnDisabled,
        ]}
        onPress={handleConnect}
        activeOpacity={0.8}
        disabled={!(selectedBank && accountNumber)}
      >
        <Text
          style={[
            styles.submitText,
            !(selectedBank && accountNumber) && styles.submitTextDisabled,
          ]}
        >
          인증하기
        </Text>
      </TouchableOpacity>

      {/* 인증 모달 */}
      <Modal
        visible={showVerifyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <VerifyCodeModal
          account={accountNumber}
          bank={selectedBank}
          visible={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onVerify={() => {
            setShowVerifyModal(false);
            Alert.alert('✅ 인증 완료', '계좌 인증이 완료되었습니다.');
            router.replace('/wallet/account'); // ✅ 강제 리마운트 유도

          }}
          onResend={() => {
            // 재전송 로직 필요 시 구현
          }}
          timeLeft={180}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.grayDarkText,
    marginBottom: 20,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    backgroundColor: Colors.white,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: Colors.grayDarkText,
  },
  selectedBank: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdown: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayLightText,
    marginTop: 6,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grayBackground,
  },
  bankLogo: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: 'contain',
  },
  bankName: {
    fontSize: 16,
    color: Colors.text,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.grayLightText,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 16,
    color: Colors.text,
  },
  submitBtn: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: Colors.grayLightText,
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.white,
  },
  submitTextDisabled: {
    color: Colors.grayDarkText,
  },
});
