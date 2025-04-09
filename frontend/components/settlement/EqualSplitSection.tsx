import React from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { MaterialIcons } from '@expo/vector-icons';

interface Participant {
  memberId: number;
  name: string;
  profileImage: string | null;
  state: 'JOINED' | 'WAIT';
}

interface RoundData {
  round: number;
  totalPrice: number;
  splitAmounts: {
    memberId: number;
    price: number;
  }[];
}

interface Props {
  participants: Participant[];
  splitAmounts: string[];
  totalAmount: string;
  onAmountChange: (text: string) => void;
  onUpdateAmount: (index: number, value: string) => void;
  onRemove: (id: number) => void;
  onConfirm: () => void;
  remainingAmount: number;
  formatCurrency: (value: string) => string;
  onOpenConfirmModal: (data: RoundData) => void;
  round: number;
}

export default function EqualSplitSection({
  participants,
  splitAmounts,
  totalAmount,
  onAmountChange,
  onUpdateAmount,
  onRemove,
  onConfirm,
  remainingAmount,
  formatCurrency,
}: Props) {
  const handleInputChange = (text: string) => {
    const formatted = formatCurrency(text);
    onAmountChange(formatted);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      {/* 금액 입력 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.textInput}
          placeholder="금액을 입력해주세요."
          placeholderTextColor={Colors.grayLightText}
          value={totalAmount}
          onChangeText={handleInputChange}
          keyboardType="number-pad"
        />
        <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
          <Text style={styles.confirmText}>확인</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={participants}
        keyExtractor={(item) => item.memberId.toString()}
        contentContainerStyle={[styles.listContent, { paddingBottom: 120 }]}
        renderItem={({ item, index }) => {
          const imageSource =
            item.profileImage && item.profileImage.trim() !== ''
              ? { uri: item.profileImage }
              : require('@/assets/images/defaultprofile.png');

          return (
            <View style={styles.itemRow}>
              <View style={styles.profileSection}>
                <Image source={imageSource} style={styles.profileImage} />
                <Text style={styles.nameText}>{item.name}</Text>
              </View>
              <View style={styles.amountSection}>
                <TextInput
                  style={styles.amountInput}
                  value={splitAmounts[index] ?? ''}
                  onChangeText={(text) =>
                    onUpdateAmount(index, formatCurrency(text))
                  }
                  keyboardType="number-pad"
                />
                {participants.length > 1 && (
                  <TouchableOpacity onPress={() => onRemove(item.memberId)}>
                    <MaterialIcons name="delete" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* 남은 금액 */}
      {typeof remainingAmount === 'number' && !isNaN(remainingAmount) && (
        <View style={styles.remainingBox}>
          <Text style={styles.remainingText}>
            남은 금액: {formatCurrency(remainingAmount.toString())}원
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginHorizontal: 24,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    fontFamily: Fonts.regular,
  },
  confirmButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    marginLeft: 10,
  },
  confirmText: {
    color: Colors.primary,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 160,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    marginBottom: 12,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileImage: {
    width: 44,
    height: 44,
    borderRadius: 10,
  },
  nameText: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: Fonts.regular,
  },
  amountSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  amountInput: {
    minWidth: 80,
    textAlign: 'right',
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primary,
    fontSize: 18,
    fontFamily: Fonts.regular,
    color: Colors.text,
    paddingVertical: 2,
  },
  remainingBox: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: Colors.white,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  remainingText: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: Colors.primary,
  },
});
