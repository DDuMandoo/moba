// ✅ app/promises/[id]/edit.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image as RNImage,
} from 'react-native';
import { launchImageLibraryAsync, MediaTypeOptions } from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button } from '@/components/ui/Button';
import CustomAlert from '@/components/CustomAlert';
import dayjs from 'dayjs';
import Colors from '@/constants/Colors';
import CustomDateTimePicker from '@/components/modal/CustomDateTimePicker';
import FriendSearchModal from '@/components/modal/FriendSearchModal';
import AppointmentConfirmModal from '@/components/modal/AppointmentConfirmModal';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import axiosInstance, { getAccessToken } from '@/app/axiosInstance';
import * as FileSystem from 'expo-file-system';
import SelectedProfileItem from '@/components/profile/SelectedProfileItem';

const API_URL = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.API_URL;

export default function AppointmentEditPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [dateTime, setDateTime] = useState<Date | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number; memo?: string } | null>(null);
  const [friends, setFriends] = useState<{ id: number; name: string; image: string }[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const res = await axiosInstance.get(`/appointments/${id}`);
        const a = res.data.result;
        setName(a.name);
        setOriginalImage(a.imageUrl);
        setImage(a.imageUrl);
        setDateTime(new Date(a.time));
        setLocation({ latitude: a.latitude, longitude: a.longitude, memo: a.memo });
        setFriends((a.participants || []).map((m: any) => ({ id: m.memberId, name: m.name, image: m.profileImage || '' })));
      } catch (err) {
        console.error('❌ 약속 불러오기 실패:', err);
      }
    };
    fetchData();
  }, [id]);

  const handleSelectImage = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1
    });
    if (!result.canceled && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      if (/^file:|^content:/.test(uri)) setImage(uri);
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
    if (!id) return;
    try {
      const payload = {
        name,
        time: dateTime?.toISOString(),
        latitude: location?.latitude ?? 37.5665,
        longitude: location?.longitude ?? 126.978,
        memo: location?.memo ?? ''
      };

      const fileUri = FileSystem.documentDirectory + 'data.json';
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(payload), { encoding: FileSystem.EncodingType.UTF8 });

      const formData = new FormData();
      formData.append('data', {
        uri: fileUri,
        type: 'application/json',
        name: 'data.json'
      } as any);

      if (image && image !== originalImage) {
        formData.append('image', {
          uri: image,
          type: 'image/jpeg',
          name: 'appointment.jpg'
        } as any);
      } else if (!image && originalImage) {
        await axiosInstance.delete(`/appointments/${id}/image`);
      }

      const accessToken = await getAccessToken();
      await axiosInstance.patch(`${API_URL}/appointments/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      router.replace(`/promises/${id}`);
    } catch (err: any) {
      console.error('❌ 수정 실패:', err);
      setAlertMessage(err?.response?.data?.message || '수정에 실패했어요!');
      setAlertVisible(true);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          <TouchableOpacity onPress={handleSelectImage} style={styles.imageBox} activeOpacity={0.8}>
            {image ? (
              <>
                <RNImage source={{ uri: image }} style={styles.image} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.deleteIcon}
                  onPress={() => setImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.background} />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.imagePlaceholder}>약속 대표 사진을 첨부해주세요.</Text>
            )}
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
          <Text style={styles.label}>날짜 및 시간 <Text style={{ color: Colors.secondary }}>*</Text></Text>
          {dateTime && (
            <View style={styles.selectedRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.selectedText}>{dayjs(dateTime).format('YYYY년 M월 D일 HH:mm')}</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.selectBox}>
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

        <View style={styles.card}>
          <Text style={styles.label}>참가자</Text>
          <View style={styles.participantRow}>
            {friends.map((f) => (
              <SelectedProfileItem
                key={f.id}
                name={f.name}
                image={f.image}
                size={50}
                onRemove={() => {
                  setFriends((prev) => prev.filter((p) => p.id !== f.id));
                }}
              />
            ))}
          </View>
          <TouchableOpacity onPress={() => setShowFriendModal(true)} style={styles.selectBox}>
            <Ionicons name="people-outline" size={20} color={Colors.grayDarkText} />
            <Text style={styles.selectText}>참가자 검색</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>장소</Text>
          {location?.memo && (
            <View style={styles.selectedRow}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
              <Text style={styles.selectedText}>{location.memo}</Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => router.push('/promises/locationSearch')}
            style={styles.selectBox}
          >
            <Ionicons name="location-outline" size={20} color={Colors.grayDarkText} />
            <Text style={styles.selectText}>장소 검색</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonBox}>
          <Button.Large title="수정 완료" onPress={handleSubmit} />
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
        initialSelected={friends.map(f => ({ memberId: f.id, name: f.name, email: '', profileImage: f.image }))}
        onSelect={(members) =>
          setFriends(members.map((m) => ({ id: m.memberId, name: m.name, image: m.profileImage ?? '' })))
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
          participants: friends
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { padding: '5%', paddingBottom: 20, backgroundColor: Colors.background },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 20 },
  deleteIcon: { position: 'absolute', top: 4, right: 4, borderRadius: 999, padding: 2, zIndex: 1 },
  imageBox: { height: 160, backgroundColor: '#f0f0f0', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: '100%', borderRadius: 12 },
  imagePlaceholder: { color: Colors.grayLightText, fontSize: 14 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 12, marginTop: 8 },
  selectBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 10, marginTop: 8 },
  selectText: { color: Colors.grayDarkText, fontSize: 15 },
  buttonBox: { marginTop: 10 },
  participantRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap', marginBottom: 2, marginTop: 6 },
  selectedRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, marginLeft: 2, padding: 5 },
  selectedText: { color: Colors.primary, fontSize: 15 },
});
