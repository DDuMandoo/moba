import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { Button } from '@/components/ui/Button';


interface ConfirmParticipant {
  memberId: number;
  name: string;
  profileImage: string | null;
  price: number;
}

interface RoundParticipant extends ConfirmParticipant {}

interface Round {
  round: number;
  totalPrice: number;
  participants: RoundParticipant[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalAmount: number;
  participantTotals: ConfirmParticipant[];
  rounds: Round[]; // ✅ 이 줄 추가!!
}
export default function TransferConfirmModal({
  visible,
  onClose,
  onConfirm,
  totalAmount,
  participantTotals,
}: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>최종확인</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={Colors.black} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subText}>정산 금액이 맞는지 확인해주세요!</Text>

          {/* Total Amount */}
          <Text style={styles.totalAmountText}>
            총 {totalAmount.toLocaleString()}원{' '}
            <Text style={styles.roundText}>(2차)</Text>
          </Text>

          {/* Member list */}
          <FlatList
            data={participantTotals}
            keyExtractor={(item) => `participant-${item.memberId}`}
            style={{ marginTop: 20 }}
            renderItem={({ item }) => (
              <View style={styles.personRow}>
                <View style={styles.profileWrapper}>
                  <Image
                    source={
                      item.profileImage
                        ? { uri: item.profileImage }
                        : require('@/assets/images/defaultprofile.png')
                    }
                    style={styles.profileImage}
                  />
                  <Text style={styles.name}>{item.name}</Text>
                </View>
                <Text style={styles.amount}>{item.price.toLocaleString()}</Text>
              </View>
            )}
          />

          <View style={{ marginTop: 28 }}>
            <Button.Medium title="정산 요청하기" onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 24,
    maxHeight: '85%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
  },
  subText: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.grayDarkText,
    fontFamily: Fonts.regular,
  },
  totalAmountText: {
    marginTop: 20,
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
  },
  roundText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  personRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  profileWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  name: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  amount: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
});
