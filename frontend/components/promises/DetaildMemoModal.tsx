import React from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import Colors from '@/constants/Colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// require로 이미지 불러오기 (경로와 파일명이 실제 프로젝트와 일치해야 합니다)
const customMarkerImg = require('@/assets/images/CustomMarker.png');

interface DetailedMemoModalProps {
  visible: boolean;
  memo: string;
  setMemo: (text: string) => void;
  selectedPlaceName?: string;
  selectedPlaceCategory?: string;
  selectedPlaceAddress?: string;
  onConfirm: () => void;
  onClose: () => void;
}

const DetailedMemoModal: React.FC<DetailedMemoModalProps> = ({
  visible,
  memo,
  setMemo,
  selectedPlaceName,
  selectedPlaceCategory,
  selectedPlaceAddress,
  onConfirm,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              {/* 상단 제목 및 부제목 (왼쪽 정렬) */}
              <View style={styles.headerContainer}>
                <Text style={styles.modalTitle}>상세 장소 입력</Text>
                <Text style={styles.modalSubtitle}>
                  선택한 장소를 기준으로 세부 위치를 입력해주세요.
                </Text>
              </View>
              {/* 커스텀 마커 이미지와 장소 정보 */}
              <View style={styles.placeInfoContainer}>
                <Image source={customMarkerImg} style={styles.markerImage} />
                <View style={styles.placeTextContainer}>
                  {selectedPlaceName && <Text style={styles.placeName}>{selectedPlaceName}</Text>}
                  {selectedPlaceCategory && <Text style={styles.placeCategory}>{selectedPlaceCategory}</Text>}
                  {selectedPlaceAddress && <Text style={styles.placeAddress}>{selectedPlaceAddress}</Text>}
                </View>
              </View>
              {/* 메모 입력창 */}
              <TextInput
                style={styles.memoInput}
                placeholder="세부 위치를 입력해주세요. (최대 25자)"
                placeholderTextColor={Colors.grayLightText}
                value={memo}
                onChangeText={setMemo}
                multiline
              />
              {/* 확인 버튼 (오른쪽 정렬) */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.confirmButton} onPress={onConfirm}>
                  <Text style={styles.confirmText}>확인</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.grayDarkText,
    textAlign: 'left',
  },
  placeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  markerImage: {
    width: 60,
    height: 60,
    marginRight: 12,
  },
  placeTextContainer: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  placeCategory: {
    fontSize: 14,
    color: Colors.logo,
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  memoInput: {
    width: '100%',
    minHeight: 30,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top',
    color: Colors.black,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DetailedMemoModal;
