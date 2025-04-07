import React, { useEffect, useState, useRef } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';
import EditPlaceListModal from './EditPlaceListModal';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { PlaceItem } from '@/types/PlaceItem';

interface MapViewSectionProps {
  appointmentId: number;
  placeId?: string;
  placeName?: string;
  isHost: boolean;
  appointmentTime?: string;
  isEnded: boolean;
}

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
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();
  const { selectedPlace, from } = useLocalSearchParams<{ selectedPlace?: string; from?: string }>();

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
      setParticipants(res.data.result.participants);
    } catch (err) {
      console.error('❌ 위치 조회 실패:', err);
    }
  };

  const connectWebSocket = () => {
    ws.current = new WebSocket(`wss://j12a601.p.ssafy.io/ws/location?appointmentId=${appointmentId}`);
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
  };

  useEffect(() => {
    fetchPlaces();
    const diffMinutes = dayjs(appointmentTime).diff(dayjs(), 'minute');
    if (diffMinutes <= 10 && diffMinutes >= -10) connectWebSocket();
    return () => ws.current?.close();
  }, [appointmentId, appointmentTime]);

  useEffect(() => {
    if (from === 'list' && selectedPlace) {
      try {
        const parsed: PlaceItem = JSON.parse(selectedPlace);
        setPlaces((prev) => {
          const exists = prev.some((p) => p.placeId === parsed.placeId);
          return exists ? prev : [...prev, parsed];
        });
      } catch (e) {
        console.warn('❌ 선택된 장소 파싱 실패:', e);
      }
    }
  }, [selectedPlace]);

  const matchedPlace = places.find((p) => p.placeId.toString() === placeId);
  const customMarkerImage = 'https://moba-image.s3.ap-northeast-2.amazonaws.com/profile/CustomMarker.png';
  const KAKAO_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
  const mapHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }</style><script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false"></script><script>const place = ${JSON.stringify(matchedPlace)};window.onload = function () {kakao.maps.load(function () {var map = new kakao.maps.Map(document.getElementById('map'), {center: new kakao.maps.LatLng(37.5665, 126.9780),level: 3});if (place) {const markerImage = new kakao.maps.MarkerImage('${customMarkerImage}', new kakao.maps.Size(80, 80), {offset: new kakao.maps.Point(40, 80)});new kakao.maps.Marker({position: new kakao.maps.LatLng(place.latitude, place.longitude),image: markerImage,map: map});map.setCenter(new kakao.maps.LatLng(place.latitude, place.longitude));}});};</script></head><body><div id="map"></div></body></html>`;

  const handleSavePlaces = async (updated: PlaceItem[]) => {
    try {
      const accessToken = await getAccessToken();
      const placesToSend = updated.map((place, i) => ({ placeId: place.placeId, order: i + 1 }));
      await axiosInstance.put(`/appointments/${appointmentId}/places/order`, { places: placesToSend }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setPlaces(updated);
    } catch (err) {
      console.error('장소 순서 저장 실패:', err);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapBox}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          javaScriptEnabled
          domStorageEnabled
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
                  <TouchableOpacity style={styles.iconButtonSmall} onPress={() => setShowEditModal(true)}>
                    <AntDesign name="edit" size={16} color={Colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.iconButtonSmall}>
                  <Ionicons name="navigate" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.subText}>약속에서 방문할 장소들을 추가해보세요.</Text>
            {places.map((place, index) => (
              <View key={place.placeId}>
                <Text style={styles.listItem}>{index + 1}. {place.name}</Text>
                <Text style={styles.listItem}>{place.category} / {place.address}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <More10CheckModal visible={showModal} onClose={() => setShowModal(false)} />
      <EditPlaceListModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
        places={places}
        onSave={handleSavePlaces}
        onAddPlace={() => {
          setShowEditModal(false);
          router.push({
            pathname: '/promises/locationSearch',
            params: {
              mode: 'list',
              appointmentId: appointmentId.toString(),
            },
          });
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subText: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  listItem: {
    fontSize: 15,
    color: '#333',
  },
  placeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
});