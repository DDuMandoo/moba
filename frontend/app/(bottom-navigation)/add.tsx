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
import CustomDateTimePicker from '@/components/modal/CustomDateTimePicker';
import { Ionicons } from '@expo/vector-icons';

export default function AppointmentCreatePage() {
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; memo?: string } | null>(null);
  const [friends, setFriends] = useState<number[]>([]); // [1, 2, 3]
  const [friendInfos, setFriendInfos] = useState<{ id: number; name: string; image: string }[]>([]);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const handleSelectImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });
    if (!result.canceled && result.assets.length > 0) {
      setImage(result.assets[0].uri);
      console.log('🖼 이미지 선택됨:', result.assets[0].uri);
    }
  };

  const handleOpenFriendModal = () => {
    console.log('👥 참가자 선택 모달 열기 (TODO)');
    // TODO: 친구 선택 모달 연결
  };

  const handleOpenLocationSearch = () => {
    console.log('📍 장소 검색 화면 이동');
    router.push('/promises/locationSearch');
  };

  const handleSubmit = async () => {
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

    const payload: any = {
      name,
      time: dateTime.toISOString(),
    };

    if (location?.latitude) payload.latitude = location.latitude;
    if (location?.longitude) payload.longitude = location.longitude;
    if (location?.memo?.trim()) payload.memo = location.memo;
    if (friends.length > 0) payload.friends = friends;

    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));

    if (image) {
      formData.append('image', {
        uri: image,
        type: 'image/jpeg',
        name: 'appointment.jpg'
      } as any);
    }

    console.log('📨 FormData 전송 내용:');
    formData.forEach((value, key) => {
      console.log(`  ${key}:`, value);
    });

    try {
      const result = await dispatch(createAppointment(formData)).unwrap();
      console.log('✅ 약속 생성 성공:', result);
      router.replace(`/promises/${result.result.appointmentId}`);
    } catch (err: any) {
      console.error('❌ 약속 생성 실패:', err);
      setAlertMessage(err?.message || '약속 생성에 실패했어요!');
      setAlertVisible(true);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <TouchableOpacity onPress={handleSelectImage} style={styles.imageBox} activeOpacity={0.8}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={styles.imagePlaceholder}>약속 대표 사진을 첨부해주세요.</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.imageButton} onPress={handleSelectImage}>
          <Text style={styles.imageButtonText}>📂 사진 첨부</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>약속명 <Text style={{ color: Colors.secondary }}>*</Text></Text>
        <TextInput
          style={styles.input}
          placeholder="약속명을 입력해주세요."
          value={name}
          onChangeText={setName}
          placeholderTextColor={Colors.grayLightText}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>참가자 선택</Text>
        <Text style={styles.subText}>약속을 만들고 URL을 통해서도 참가자를 초대할 수 있어요!</Text>
        <TouchableOpacity onPress={handleOpenFriendModal} style={styles.selectBox} activeOpacity={0.7}>
          <Ionicons name="people-outline" size={20} color={Colors.grayDarkText} />
          <Text style={styles.selectText}>참가자 검색</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>날짜 및 시간 선택 <Text style={{ color: Colors.secondary }}>*</Text></Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectBox} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={20} color={Colors.grayDarkText} />
          <Text style={styles.selectText}>
            {dateTime ? dayjs(dateTime).format('YYYY년 M월 D일 HH:mm') : '날짜 및 시간 선택'}
          </Text>
        </TouchableOpacity>
        <CustomDateTimePicker
          visible={showDatePicker}
          initialValue={dateTime || new Date()}
          onClose={() => setShowDatePicker(false)}
          onConfirm={(val) => setDateTime(val)}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>장소 선택</Text>
        <TouchableOpacity onPress={handleOpenLocationSearch} style={styles.selectBox} activeOpacity={0.7}>
          <Ionicons name="location-outline" size={20} color={Colors.grayDarkText} />
          <Text style={styles.selectText}>장소 검색</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.buttonBox}>
        <Button.Large
          title="약속 생성"
          onPress={handleSubmit}
          disabled={!name.trim() || !dateTime}
        />
      </View>

      <CustomAlert
        visible={alertVisible}
        title="에러"
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    padding: '5%',
    paddingBottom: 20
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
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
    color: Colors.grayLightText,
    fontSize: 14
  },
  imageButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.grayLightText,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center'
  },
  imageButtonText: {
    color: Colors.text,
    fontSize: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8
  },
  subText: {
    fontSize: 13,
    color: Colors.grayDarkText,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12
  },
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12
  },
  selectText: {
    color: Colors.grayDarkText,
    fontSize: 15
  },
  buttonBox: {
    marginTop: 20
  }
});
