import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { createAppointment } from '@/redux/slices/appointmentSlice';
import { Button } from '@/components/ui/Button';
import CustomAlert from '@/components/CustomAlert';
import dayjs from 'dayjs';
import Colors from '@/constants/Colors';
import type { AppDispatch } from '@/redux/store';
import AppointmentConfirmModal from '@/components/modal/AppointmentConfirmModal';
import CustomDateTimePicker from '@/components/modal/CustomDateTimePicker';

export default function AppointmentCreatePage() {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; memo?: string } | null>(null);
  const [friends, setFriends] = useState<number[]>([]);
  const [friendInfos, setFriendInfos] = useState<{ id: number; name: string; image: string }[]>([]);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null);

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleSelectImage = async () => {
    const result = await launchImageLibraryAsync({ mediaTypes: MediaTypeOptions.Images, allowsEditing: true });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleOpenFriendModal = () => {
    // TODO: 친구 선택 모달 열기 구현 예정
  };

  const handleOpenLocationSearch = () => {
    router.push('/promises/locationSearch');
  };

  const handleSubmit = async () => {
    if (!name) return;

    const payload = {
      name,
      time: dateTime ? new Date(dateTime).toISOString() : new Date().toISOString(),
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      memo: location?.memo || '',
      friends,
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
    if (image) {
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'appointment.jpg',
      } as any);
    }

    try {
      const result = await dispatch(createAppointment(formData)).unwrap();
      setCreatedId(result.appointmentId);
      setConfirmVisible(true);
    } catch (error: any) {
      setAlertMessage(error);
      setAlertVisible(true);
    }
  };

  const handleConfirm = () => {
    if (!createdId) return;
    setConfirmVisible(false);
    router.replace(`/promises/${createdId}`);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <TouchableOpacity onPress={handleSelectImage} style={styles.imageBox} activeOpacity={0.8}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        ) : (
          <Text style={styles.imagePlaceholder}>+ 사진 첨부</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.label}>약속명 *</Text>
      <TextInput
        style={styles.input}
        placeholder="약속명을 입력해주세요."
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>참가자 선택</Text>
      <TouchableOpacity onPress={handleOpenFriendModal} style={styles.input} activeOpacity={0.7}>
        <Text style={styles.placeholderText}>👥 참가자 검색</Text>
      </TouchableOpacity>

      <Text style={styles.label}>날짜 및 시간 선택</Text>
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input} activeOpacity={0.7}>
        <Text style={dateTime ? styles.text : styles.placeholderText}>
          {dateTime ? dayjs(dateTime).format('YYYY년 M월 D일 HH:mm') : '📅 날짜 및 시간 선택'}
        </Text>
      </TouchableOpacity>

      <CustomDateTimePicker
        visible={showDatePicker}
        initialValue={dateTime || new Date()}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(val) => setDateTime(val)}
      />

      <Text style={styles.label}>장소 선택</Text>
      <TouchableOpacity onPress={handleOpenLocationSearch} style={styles.input} activeOpacity={0.7}>
        <Text style={styles.placeholderText}>📍 장소 검색</Text>
      </TouchableOpacity>

      <View style={styles.buttonBox}>
        <Button.Large title="약속 생성" onPress={handleSubmit} disabled={!name} />
      </View>

      <AppointmentConfirmModal
        visible={confirmVisible}
        onClose={() => setConfirmVisible(false)}
        onConfirm={handleConfirm}
        data={{
          name,
          time: dateTime ? dayjs(dateTime).format('YYYY년 M월 D일 HH:mm') : '-',
          location: location?.memo || '-',
          participants: friendInfos
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    paddingVertical: 24
  },
  imageBox: {
    height: 160,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
  imagePlaceholder: {
    color: '#aaa'
  },
  label: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.black
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12
  },
  placeholderText: {
    color: '#888'
  },
  text: {
    color: Colors.black
  },
  buttonBox: {
    marginTop: 40
  }
});
