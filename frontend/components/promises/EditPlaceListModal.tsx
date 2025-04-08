// ✨ 스르륵 애니메이션으로 순서 변경되는 장소 리스트 (Reanimated)
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { PlaceItem } from '@/types/PlaceItem';
import axiosInstance, { getAccessToken } from '@/app/axiosInstance';
import PlaceCardItem from './PlaceCardItem';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

interface Props {
  visible: boolean;
  onClose: () => void;
  places: PlaceItem[];
  onSave: (updated: PlaceItem[]) => void;
  onAddPlace: () => void;
  appointmentId: number;
}

export default function EditPlaceListModal({
  visible,
  onClose,
  places,
  onSave,
  onAddPlace,
  appointmentId,
}: Props) {
  const [localPlaces, setLocalPlaces] = useState<PlaceItem[]>([]);

  useEffect(() => {
    if (visible && Array.isArray(places)) {
      setLocalPlaces(places);
    }
  }, [visible, places]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localPlaces.length) return;
    const updated = [...localPlaces];
    const temp = updated[fromIndex];
    updated[fromIndex] = updated[toIndex];
    updated[toIndex] = temp;
    setLocalPlaces(updated);
  };

  const handleRemove = async (appointmentPlaceId: number) => {
    try {
      const accessToken = await getAccessToken();
      await axiosInstance.delete(`/appointments/${appointmentId}/places/${appointmentPlaceId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLocalPlaces((prev) =>
        prev.filter((p) => p.appointmentPlaceId !== appointmentPlaceId)
      );
    } catch (err) {
      console.error('❌ 장소 삭제 실패:', err);
      Alert.alert('삭제 실패', '장소를 삭제하는 중 오류가 발생했습니다.');
    }
  };

  const handleConfirm = async () => {
    try {
      const ordered = localPlaces.map((p, idx) => ({
        placeId: p.placeId,
        order: idx + 1,
      }));
      const accessToken = await getAccessToken();
      await axiosInstance.put(
        `/appointments/${appointmentId}/places/order`,
        { places: ordered },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      onSave(localPlaces);
      onClose();
    } catch (err) {
      console.error('❌ 순서 저장 실패:', err);
      Alert.alert('저장 실패', '장소 순서를 저장하는 중 오류가 발생했습니다.');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.modalBox, { maxHeight: '80%' }]}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>약속 장소 목록 수정</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subText}>장소를 추가/삭제하거나 순서를 바꿔보세요.</Text>

          <TouchableOpacity onPress={onAddPlace} style={styles.addButton}>
            <AntDesign name="plus" size={20} color={Colors.primary} />
          </TouchableOpacity>

          <ScrollView style={styles.listSection}>
            <View style={styles.listBox}>
              {localPlaces.map((item, index) => (
                <Animated.View
                  key={item.placeId}
                  entering={FadeIn}
                  exiting={FadeOut}
                  layout={Layout.springify()}
                  style={styles.itemRow}
                >
                  <View style={styles.orderButtons}>
                    <TouchableOpacity onPress={() => moveItem(index, index - 1)}>
                      <AntDesign name="up" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => moveItem(index, index + 1)}>
                      <AntDesign name="down" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1 }}>
                    <PlaceCardItem
                      index={index + 1}
                      name={item.name}
                      category={item.category}
                      address={item.address}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemove(item.appointmentPlaceId)}
                    style={styles.trashButton}
                  >
                    <Ionicons name="trash-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.bottomRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    width: width * 0.9,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subText: {
    fontSize: 13,
    color: Colors.grayDarkText,
    marginBottom: 12,
  },
  listSection: {
    flexGrow: 0,
    marginBottom: 10,
  },
  listBox: {
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  orderButtons: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  trashButton: {
    padding: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 6,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontWeight: '600',
  },
});
