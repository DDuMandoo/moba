// app/wallet/charge.tsx
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import ChargeAmountInput from '@/components/charge/ChargeAmountInput';
import ChargeSourceList from '@/components/charge/ChargeSourceList';
import ChargeConfirmModal from '@/components/charge/ChargeConfirmModal';
import Colors from '@/constants/Colors';

export default function ChargePage() {
  const [amount, setAmount] = useState(0);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleCharge = () => {
    if (amount >= 10000 && amount <= 1000000 && selectedAccountId) {
      setModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 충전 금액 입력 영역 */}
        <ChargeAmountInput amount={amount} setAmount={setAmount} />

        {/* 충전 수단 리스트 */}
        <ChargeSourceList
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
        />
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View
        style={{
          position: 'absolute',
          bottom: 20,
          width: '100%',
          alignItems: 'center',
        }}
      >
        <Button.Large
          title="충전"
          onPress={handleCharge}
          disabled={amount < 10000 || !selectedAccountId}
          style={{ backgroundColor: amount < 10000 || !selectedAccountId ? Colors.grayLightText : Colors.primary }}
        />
      </View>

      {/* 충전 완료 모달 */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ChargeConfirmModal onClose={() => setModalVisible(false)} />
      </Modal>
    </KeyboardAvoidingView>
  );
}
