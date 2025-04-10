import React, { useEffect, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectAccount, setAccountList } from '@/redux/slices/accountSlice';
import { setAmount as setChargeAmount } from '@/redux/slices/chargeSlice';
import axiosInstance from '@/app/axiosInstance';
import { fetchWalletBalance } from '@/redux/slices/walletSlice';

export default function ChargePage() {
  const dispatch = useAppDispatch();
  const selectedAccountId = useAppSelector((state) => state.account.selectedAccountId);
  const [amount, setAmount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  // ✅ 계좌 목록 불러오기
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await axiosInstance.get('/wallets/account');
        const accounts = res.data.result?.accounts ?? [];
        dispatch(setAccountList(accounts));
      } catch (err) {
      }
    };

    fetchAccounts();
  }, []);

  // ✅ amount 값 Redux에 반영
  useEffect(() => {
    dispatch(setChargeAmount(amount));
  }, [amount]);

  const isAmountValid = amount >= 10000 && amount <= 1000000;
  const isReadyToCharge = isAmountValid && !!selectedAccountId;

  const handleCharge = () => {
    if (isReadyToCharge) {
      setModalVisible(true);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <ChargeAmountInput amount={amount} setAmount={setAmount}  label="충전 금액" />
        <ChargeSourceList
          selectedAccountId={selectedAccountId}
          onSelectAccount={(id) => {
            dispatch(selectAccount(id));
          }}
        />
      </ScrollView>

      <View style={{ position: 'absolute', bottom: 20, width: '100%', alignItems: 'center' }}>
        <Button.Large
          title="충전"
          onPress={handleCharge}
          disabled={!isReadyToCharge}
          style={{
            backgroundColor: isReadyToCharge ? Colors.primary : Colors.grayLightText,
          }}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ChargeConfirmModal
          onClose={() => {
            setModalVisible(false);
            dispatch(fetchWalletBalance());
          }}
        />
      </Modal>
    </KeyboardAvoidingView>
  );
}
