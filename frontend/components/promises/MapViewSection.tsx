// ✅ 변경사항 요약
// - 각 지도는 WebView에서 html string이 아닌 Netlify에 배포한 URL로 접근
// - default.html, route.html, participants.html 세 가지 URL 분리 적용
// - route와 participants는 data를 쿼리스트링에 실어 보냄 (encodeURIComponent + JSON.stringify)

import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import WebView from 'react-native-webview';
import Colors from '@/constants/Colors';
import axiosInstance, { getAccessToken } from '@/app/axiosInstance';
import dayjs from 'dayjs';
import More10CheckModal from '@/components/promises/More10CheckModal';
import * as Location from 'expo-location';
import { useAppSelector } from '@/redux/hooks';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import EditPlaceListModal from './EditPlaceListModal';
import { useRouter, useFocusEffect } from 'expo-router';
import { PlaceItem } from '@/utils/PlaceItem';
import PlaceCardItem from './PlaceCardItem';

interface MapViewSectionProps {
  appointmentId: number;
  placeId?: string;
  placeName?: string;
  isHost: boolean;
  appointmentTime?: string;
  isEnded: boolean;
}

const NETLIFY_BASE_URL = 'https://storied-chaja-c0f82a.netlify.app';

export default function MapViewSection({
  appointmentId,
  placeId,
  placeName,
  isHost,
  appointmentTime,
  isEnded,
}: MapViewSectionProps) {
  const { profile } = useAppSelector((state) => state.user);
  const [participants, setParticipants] = useState<any[]>([]);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mapUrl, setMapUrl] = useState(`${NETLIFY_BASE_URL}/default.html`);
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();

  const fetchPlaces = async () => {
    try {
      const res = await axiosInstance.get(`/appointments/${appointmentId}/places`);
      setPlaces(res.data.result.places);
    } catch (err) {
      console.error('❌ 장소 목록 조회 실패:', err);
    }
  };

  const checkLocationSharing = async () => {
    if (!appointmentTime) return;
    const diffMinutes = dayjs(appointmentTime).diff(dayjs(), 'minute');
    if (diffMinutes > 10 || diffMinutes < -10) {
      setShowModal(true);
      return;
    }
    try {
      const res = await axiosInstance.get(`/appointments/${appointmentId}/locations`);
      const participants = res.data.result.participants;
      setParticipants(participants);
      const data = encodeURIComponent(JSON.stringify(participants.map((p: any) => ({
        name: p.memberName,
        latitude: p.latitude,
        longitude: p.longitude,
        image: p.memberImage,
      }))));
      setMapUrl(`${NETLIFY_BASE_URL}/participants.html?data=${data}`);
    } catch (err) {
      console.error('❌ 위치 조회 실패:', err);
    }
  };

  const connectWebSocket = async () => {
    const accessToken = await getAccessToken();
    ws.current = new WebSocket(
      `wss://j12a601.p.ssafy.io/api/ws/location?appointmentId=${appointmentId}&token=${accessToken}`
    );
    ws.current.onopen = () => console.log('✅ WebSocket 연결됨');
    ws.current.onmessage = async (e) => {
      const message = JSON.parse(e.data);
      if (message.type === 'request_location') {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const location = await Location.getCurrentPositionAsync({});
        const payload = {
          memberId: profile?.memberId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        ws.current?.send(JSON.stringify(payload));
      }
    };
    ws.current.onerror = (e) => console.error('❌ WebSocket 에러:', e);
    ws.current.onclose = () => console.log('🛑 WebSocket 연결 종료');
  };

  const generateMapWithRoute = async () => {
    if (places.length < 2) return;
    const encoded = encodeURIComponent(JSON.stringify(places.map((p: PlaceItem) => ({
      latitude: p.latitude,
      longitude: p.longitude
    }))));
    setMapUrl(`${NETLIFY_BASE_URL}/route.html?data=${encoded}`);
  };

  useEffect(() => {
    setMapUrl(`${NETLIFY_BASE_URL}/default.html`);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPlaces();
      const diffMinutes = dayjs(appointmentTime).diff(dayjs(), 'minute');
      if (diffMinutes <= 10 && diffMinutes >= -10) {
        connectWebSocket();
      }
      return () => {
        ws.current?.close();
      };
    }, [appointmentId, appointmentTime])
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapBox}>
        <WebView
          source={{ uri: mapUrl }}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
          scrollEnabled={false}
          style={{ flex: 1, borderRadius: 10 }}
        />
      </View>

      {!isEnded && (
        <View style={styles.locationButtonWrapper}>
          <TouchableOpacity style={styles.locationButton} onPress={checkLocationSharing}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <AntDesign name="checksquare" size={18} color={Colors.secondary} />
              <Text style={styles.locationButtonText}>위치 체크</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <View style={styles.placeListBoxWrapper}>
          <View style={styles.placeListBox}>
            <View style={styles.placeListHeader}>
              <Text style={styles.sectionTitle}>약속 장소 목록</Text>
              <View style={styles.actionButtons}>
                {isHost && (
                  <TouchableOpacity
                    style={styles.iconButtonSmall}
                    onPress={async () => {
                      await fetchPlaces();
                      setShowEditModal(true);
                    }}>
                    <AntDesign name="edit" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.iconButtonSmall} onPress={generateMapWithRoute}>
                  <MaterialIcons name="route" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.subText}>약속에서 방문할 장소들을 확인해보세요.</Text>
            {places.map((place, index) => (
              <PlaceCardItem
                key={place.placeId}
                index={index + 1}
                name={place.name}
                category={place.category}
                address={place.address}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      <More10CheckModal visible={showModal} onClose={() => setShowModal(false)} />
      <EditPlaceListModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        places={places}
        onSave={() => fetchPlaces()}
        onAddPlace={() => {
          setShowEditModal(false);
          router.push({ pathname: '/promises/locationSearch', params: { mode: 'list', appointmentId: appointmentId.toString() } });
        }}
        appointmentId={appointmentId}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  mapBox: {
    width: width * 0.9,
    alignSelf: 'center',
    height: 260,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  locationButtonWrapper: {
    marginTop: 10,
    alignItems: 'flex-end',
    paddingHorizontal: '5%',
  },
  locationButton: {
    backgroundColor: Colors.white,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    elevation: 2,
  },
  locationButtonText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  actionButtons: { flexDirection: 'row', gap: 8 },
  iconButtonSmall: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    padding: 5,
  },
  content: {
    padding: 20,
    gap: 14,
    backgroundColor: Colors.white,
  },
  placeListBoxWrapper: {
    alignItems: 'center',
    width: '100%',
  },
  placeListBox: {
    width: width * 0.9,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 16,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.black,
  },
  subText: {
    fontSize: 14,
    color: Colors.grayLightText,
    marginBottom: 10,
  },
  placeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
});