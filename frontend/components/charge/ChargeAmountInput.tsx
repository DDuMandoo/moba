import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';

interface Props {
  amount: number;
  setAmount: (val: number) => void;
  label?: string; // ✅ 라벨 텍스트 prop 추가
}

const quickAmounts = [10000, 50000, 100000, 500000];

export default function ChargeAmountInput({
  amount,
  setAmount,
  label = '충전 금액', // ✅ 기본값 설정
}: Props) {
  const formatAmount = (val: number) => val.toLocaleString();

  const handleChange = (text: string) => {
    const raw = text.replace(/[^0-9]/g, '');
    const numeric = parseInt(raw || '0', 10);
    if (numeric <= 1000000) setAmount(numeric);
  };

  const handleAddQuickAmount = (add: number) => {
    const newAmount = Math.min(amount + add, 1000000);
    setAmount(newAmount);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={amount ? formatAmount(amount) : ''}
        onChangeText={handleChange}
        placeholder="금액을 입력해주세요"
        keyboardType="number-pad"
        style={styles.input}
      />
      <View style={styles.quickRow}>
        {quickAmounts.map((amt) => (
          <TouchableOpacity
            key={amt}
            style={styles.quickBtn}
            onPress={() => handleAddQuickAmount(amt)}
          >
            <View style={styles.row}>
              <Feather name="plus" size={12} color={Colors.white} style={{ marginRight: 4 }} />
              <Text style={[styles.quickText, { lineHeight: 14 }]}>
                {(amt / 10000).toFixed(0)}만원
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapper: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.text,
    marginBottom: 16,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  quickBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  quickText: {
    color: Colors.white,
    fontWeight: 'bold',
    fontSize: 12,
  },
});
