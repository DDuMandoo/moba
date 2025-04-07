import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  KeyboardAvoidingView,
  SafeAreaView
} from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Button } from '@/components/ui/Button';
import CustomAlert from '@/components/CustomAlert';
import dayjs from 'dayjs';
import Colors from '@/constants/Colors';
import CustomDateTimePicker from '@/components/modal/CustomDateTimePicker';
import FriendSearchModal from '@/components/promises/FriendSearchModal';
import AppointmentConfirmModal from '@/components/promises/AppointmentConfirmModal';
import { Ionicons } from '@expo/vector-icons';
import { getAccessToken } from '@/app/axiosInstance';
import Constants from 'expo-constants';
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Image as RNImage } from 'react-native';
import SelectedProfileItem from '@/components/profile/SelectedProfileItem';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setDraftAppointment, clearDraftAppointment } from '@/redux/slices/appointmentSlice';

const API_URL = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.API_URL;

export default function AppointmentCreatePage() {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  // location 상태에 placeName을 포함해서 표시할 수 있도록 함
  const [location, setLocation] = useState<{ placeId: number; placeName?: string; memo?: string } | null>(null);
  const [friends, setFriends] = useState<{ id: number; name: string; image: string }[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const router = useRouter();
  const { profile } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
const { draftAppointment } = useAppSelector((state) => state.appointment);

  // 개별 파라미터 분해 (무한 업데이트 문제 해결)
  const { selectedPlaceId, selectedPlaceName, selectedPlaceMemo } = useLocalSearchParams<{
    selectedPlaceId?: string;
    selectedPlaceName?: string;
    selectedPlaceMemo?: string;
  }>();

  useEffect(() => {
    if (draftAppointment) {
      setName(draftAppointment.name);
      setDateTime(draftAppointment.time ? new Date(draftAppointment.time) : null);
      setImage(draftAppointment.image || null);
      setFriends(draftAppointment.friends || []);
      setLocation(draftAppointment.location || null);
      dispatch(clearDraftAppointment()); // ✅ 복원 후 초기화
    }
  }, []);

  useEffect(() => {
    if (selectedPlaceName && selectedPlaceId) {
      setLocation({
        placeId: Number(selectedPlaceId),
        placeName: selectedPlaceName,
        memo: selectedPlaceMemo || '',
      });
    }
  }, [selectedPlaceId, selectedPlaceName, selectedPlaceMemo]);

  const handleSelectImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (typeof uri === 'string' && uri.trim() !== '' && /^file:|^content:/.test(uri)) {
        setImage(uri);
      } else {
        console.warn('🚫 유효하지 않은 이미지 URI:', uri);
        setImage(null);
      }
    } else {
      console.log('🛑 이미지 선택 취소 또는 실패');
      setImage(null);
    }
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      setAlertMessage('약속명을 입력해주세요!');
      setAlertVisible(true);
      return;
    }
    if (!dateTime) {
      setAlertMessage('날짜 및 시간을 선택해주세요!');
      setAlertVisible(true);
      return;
    }
    setConfirmVisible(true);
  };

  const handleConfirmSubmit = async () => {
    const payload = {
      name,
      time: dateTime?.toISOString(),
      placeId: location?.placeId ?? null,
      // 약속 생성 페이지에서는 선택된 장소의 memo (혹은 placeName)를 그대로 사용
      memo: location?.memo || location?.placeName || '',
      friends: friends.filter((f) => f.id !== profile?.memberId).map((f) => f.id),
    };

    try {
      const fileUri = FileSystem.documentDirectory + 'data.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      const formData = new FormData();
      formData.append('data', {
        uri: fileUri,
        type: 'application/json',
        name: 'data.json',
      } as any);
      if (image) {
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'appointment.jpg',
        } as any);
      }
      const accessToken = await getAccessToken();
      const res = await axios.post(`${API_URL}/appointments`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      const appointmentId = res?.data?.result?.appointmentId;
      router.replace(`/promises/${appointmentId}`);
    } catch (err: any) {
      console.error('❌ 약속 생성 실패:', err);
      setAlertMessage(err?.response?.data?.message || '약속 생성에 실패했어요!');
      setAlertVisible(true);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* 이미지 선택 */}
        <View style={styles.card}>
          <TouchableOpacity onPress={handleSelectImage} style={styles.imageBox} activeOpacity={0.8}>
            {image ? (
              <>
                <RNImage source={{ uri: image }} style={styles.image} resizeMode="cover" />
                <TouchableOpacity style={styles.deleteIcon} onPress={() => setImage(null)}>
                  <Ionicons name="close-circle" size={24} color={Colors.background} />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.imagePlaceholder}>약속 대표 사진을 첨부해주세요.</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSelectImage} style={styles.selectBox} activeOpacity={0.7}>
            <Ionicons name="folder-outline" size={20} color={Colors.grayDarkText} />
            <Text style={styles.selectText}>사진 첨부</Text>
          </TouchableOpacity>
        </View>

        {/* 약속명 입력 */}
        <View style={styles.card}>
          <Text style={styles.label}>
            약속명 <Text style={{ color: Colors.secondary }}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="약속명을 입력해주세요."
            value={name}
            onChangeText={setName}
            placeholderTextColor={Colors.grayLightText}
          />
        </View>

        {/* 날짜 및 시간 선택 */}
        <View style={styles.card}>
          <Text style={styles.label}>
            날짜 및 시간 선택 <Text style={{ color: Colors.secondary }}>*</Text>
          </Text>
          {dateTime && (
            <View style={styles.selectedRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.selectedText}>{dayjs(dateTime).format('YYYY년 M월 D일 HH:mm')}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectBox} activeOpacity={0.7}>
            <Ionicons name="calendar-outline" size={20} color={Colors.grayDarkText} />
            <Text style={styles.selectText}>날짜 및 시간 선택</Text>
          </TouchableOpacity>
          <CustomDateTimePicker
            visible={showDatePicker}
            initialValue={dateTime || new Date()}
            onClose={() => setShowDatePicker(false)}
            onConfirm={(val) => setDateTime(val)}
          />
        </View>

        {/* 참가자 선택 */}
        <View style={styles.card}>
          <Text style={styles.label}>참가자 선택</Text>
          <Text style={styles.subLabel}>약속을 만들고 URL을 통해서도 참가자를 초대할 수 있어요!</Text>
          <View style={styles.participantRow}>
            {friends.map((f) => (
              <SelectedProfileItem
                key={f.id}
                name={f.name}
                image={f.image}
                size={50}
                onRemove={() => setFriends((prev) => prev.filter((p) => p.id !== f.id))}
              />
            ))}
          </View>
          <TouchableOpacity onPress={() => setShowFriendModal(true)} style={styles.selectBox} activeOpacity={0.7}>
            <Ionicons name="people-outline" size={20} color={Colors.grayDarkText} />
            <Text style={styles.selectText}>참가자 검색</Text>
          </TouchableOpacity>
        </View>

        {/* 장소 선택 */}
        <View style={styles.card}>
          <Text style={styles.label}>장소 선택</Text>
          {location && (
            <View style={styles.selectedPlaceContainer}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <View style={{ marginLeft: 4 }}>
                <Text style={styles.selectedPlaceText}>{location.placeName}</Text>
                {location.memo && (
                  <Text style={styles.selectedPlaceText}>{location.memo}</Text>
                )}
              </View>
            </View>
          )}
          <TouchableOpacity
            onPress={() => {
              dispatch(setDraftAppointment({
                name,
                time: dateTime?.toISOString() || '',
                image,
                friends,
                location,
              }));
              router.push({ pathname: '/promises/locationSearch', params: { mode: 'create' } });
            }}
            style={styles.selectBox}
          >
            <Ionicons name="location-outline" size={20} color={Colors.grayDarkText} />
            <Text style={styles.selectText}>장소 검색</Text>
          </TouchableOpacity>
        </View>

        {/* 약속 생성 버튼 */}
        <View style={styles.buttonBox}>
          <Button.Large title="약속 생성" onPress={handleSubmit} />
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title="에러"
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />

      <FriendSearchModal
        visible={showFriendModal}
        onClose={() => setShowFriendModal(false)}
        initialSelected={friends.map((f) => ({
          memberId: f.id,
          name: f.name,
          email: '', // 이메일은 선택 아님
          profileImage: f.image,
        }))}
        onSelect={(members) =>
          setFriends(
            members.map((m) => ({
              id: m.memberId,
              name: m.name,
              image: m.profileImage ?? '',
            }))
          )
        }
      />

      <AppointmentConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleConfirmSubmit}
        data={{
          name,
          time: dateTime ? dayjs(dateTime).format('YYYY년 M월 D일 HH:mm') : '',
          location: location?.memo || '',
          participants: friends,
        }}
      />
    </>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollContainer: {
    padding: '5%',
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  deleteIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
    borderRadius: 999,
    padding: 2,
    zIndex: 1,
  },
  imageBox: {
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  imagePlaceholder: {
    color: Colors.grayLightText,
    fontSize: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  subLabel: {
    fontSize: 13,
    color: Colors.grayDarkText,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    marginTop: 8,
  },
  selectText: {
    color: Colors.grayDarkText,
    fontSize: 15,
  },
  buttonBox: {
    marginTop: 10,
  },
  participantRow: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 2,
    marginTop: 6,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 0.6,
    borderColor: Colors.logo,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    marginLeft: 2,
    padding: 5,
  },
  selectedText: {
    color: Colors.primary,
    fontSize: 15,
  },
  selectedPlaceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedPlaceText: {
    marginLeft: 4,
    fontSize: 16,
    color: Colors.text,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    maxHeight: SCREEN_WIDTH * 1.2,
  },
  listContent: { paddingBottom: 80 },
  placeItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginVertical: 4,
    padding: 12,
    borderRadius: 8,
    borderColor: '#eee',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  placeItemInner: { flex: 1, marginRight: 8 },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  placeCategory: { fontSize: 13, color: Colors.grayDarkText },
  emptyText: {
    textAlign: 'center',
    color: Colors.grayDarkText,
    marginTop: 20,
    fontSize: 14,
  },
  memoModalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  memoContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    width: '100%',
  },
  memoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: Colors.black,
  },
  memoInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
    color: Colors.black,
  },
  confirmButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
