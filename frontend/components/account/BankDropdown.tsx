import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Image,
} from 'react-native';
import { BANKS } from '@/constants/banks';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  selected: string;
  setSelected: (value: string) => void;
}

export default function BankDropdown({ selected, setSelected }: Props) {
  const [open, setOpen] = useState(false);

  const selectedBank = BANKS.find((b) => b.type === selected);

  return (
    <>
      {/* 버튼 */}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.9}
        style={styles.selector}
      >
        <Text style={selectedBank ? styles.selectorText : styles.placeholder}>
          {selectedBank?.name || '은행을 선택하세요'}
        </Text>
        <Ionicons name="chevron-down" size={16} color={Colors.grayDarkText} />
        </TouchableOpacity>

      {/* 모달 */}
      <Modal visible={open} animationType="fade" transparent>
        <TouchableOpacity style={styles.overlay} onPress={() => setOpen(false)} activeOpacity={1}>
          <View style={styles.modalContainer}>
            <FlatList
              data={BANKS}
              keyExtractor={(item) => item.type}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.bankItem}
                  onPress={() => {
                    setSelected(item.type);
                    setOpen(false);
                  }}
                >
                  <Image source={item.logo} style={styles.bankLogo} />
                  <Text style={styles.bankName}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    height: 48,
    backgroundColor: Colors.grayBackground,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: Colors.text,
  },
  placeholder: {
    fontSize: 16,
    color: Colors.grayLightText,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    maxHeight: '60%',
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
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
  separator: {
    height: 1,
    backgroundColor: Colors.grayBackground,
  },
});
