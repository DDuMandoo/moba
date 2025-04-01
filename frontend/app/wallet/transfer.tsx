import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import Colors from '@/constants/Colors';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectAccount } from '@/redux/slices/accountSlice';
import { setAmount as setTransferAmount } from '@/redux/slices/chargeSlice'; // ✅ 재활용
import ChargeAmountInput from '@/components/charge/ChargeAmountInput';
import ChargeSourceList from '@/components/charge/ChargeSourceList';
import { Button } from '@/components/ui/Button';
import TransferConfirmModal from '@/components/transfer/TransferConfirmModal';

export default function TransferPage() {
  const dispatch = useAppDispatch();
  const selectedAccountId = useAppSelector((state) => state.account.selectedAccountId);
  const [amount, setAmount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  const isAmountValid = amount >= 10000 && amount <= 1000000;
  const isReady = isAmountValid && !!selectedAccountId;

  const handleTransfer = () => {
    if (isReady) {
      dispatch(setTransferAmount(amount));
      setModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <ChargeAmountInput amount={amount} setAmount={setAmount} label="송금 금액" />
        <ChargeSourceList
          selectedAccountId={selectedAccountId}
          onSelectAccount={(id) => dispatch(selectAccount(id))}
        />
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 20, width: '100%', paddingHorizontal: 20 }}>
        <Button.Large
          title="송금"
          disabled={!isReady}
          onPress={handleTransfer}
          style={{
            backgroundColor: isReady ? Colors.primary : Colors.grayLightText,
            borderRadius: 12,
          }}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TransferConfirmModal onClose={() => setModalVisible(false)} />
      </Modal>
    </KeyboardAvoidingView>
  );
}
