import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons, AntDesign } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { PlaceItem } from '@/types/PlaceItem';
import axiosInstance, { getAccessToken } from '@/app/axiosInstance';

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
    if (visible) setLocalPlaces(places);
  }, [visible]);

  const handleRemove = async (placeId: number) => {
    try {
      const accessToken = await getAccessToken();
      await axiosInstance.delete(`/appointments/${appointmentId}/places/${placeId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setLocalPlaces((prev) => prev.filter((p) => p.placeId !== placeId));
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
        <View style={styles.modalBox}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>약속 장소 목록 수정</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={styles.subText}>약속 장소를 추가/삭제하거나 순서를 바꿔보세요.</Text>

          <View style={styles.listBox}>
            <DraggableFlatList
              data={localPlaces}
              keyExtractor={(item) => item.placeId.toString()}
              onDragEnd={({ data }) => setLocalPlaces(data)}
              renderItem={(params: RenderItemParams<PlaceItem>) => {
                const { item, drag, isActive } = params;
                const index = localPlaces.findIndex(p => p.placeId === item.placeId);
                return (
                  <ScaleDecorator>
                    <View style={[styles.placeItem, isActive && styles.activeItem]}>
                      <TouchableOpacity onLongPress={drag} style={styles.dragHandle}>
                        <Ionicons name="menu" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                      <View style={styles.placeTextBox}>
                        <Text style={styles.placeName}>
                          {index + 1}. {item.name}
                        </Text>
                        <Text style={styles.placeDetail}>{item.category}</Text>
                        <Text style={styles.placeDetail}>{item.address}</Text>
                      </View>
                      <TouchableOpacity onPress={() => handleRemove(item.placeId)}>
                        <Ionicons name="trash-outline" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </ScaleDecorator>
                );
              }}
            />
          </View>

          <TouchableOpacity onPress={onAddPlace} style={styles.addButton}>
            <AntDesign name="plus" size={20} color={Colors.primary} />
          </TouchableOpacity>

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
    maxHeight: '90%',
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
    fontSize: 14,
    color: Colors.grayDarkText,
    marginBottom: 10,
  },
  listBox: {
    flex: 1,
    maxHeight: 360,
    marginBottom: 12,
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    gap: 8,
  },
  activeItem: {
    backgroundColor: Colors.background,
    borderRadius: 10,
  },
  dragHandle: {
    marginTop: 4,
  },
  placeTextBox: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  placeDetail: {
    fontSize: 13,
    color: Colors.grayDarkText,
  },
  addButton: {
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 6,
    marginVertical: 10,
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
