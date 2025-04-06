// ✅ 약속 상세 MapViewSection - 디자인 개선 및 위치 공유 + 장소 목록 API 연결 + 모달 연동
import React, { useEffect, useState } from 'react';
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
import axiosInstance from '@/app/axiosInstance';
import { useLocalSearchParams } from 'expo-router';
import dayjs from 'dayjs';
import More10CheckModal from '@/components/modal/More10CheckModal';

interface MapViewSectionProps {
  appointmentId: number;
  placeId?: string;
  placeName?: string;
  isHost: boolean;
  appointmentTime?: string;
}

interface PlaceItem {
  placeId: number;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
}

export default function MapViewSection({
  appointmentId,
  placeName,
  isHost,
  appointmentTime,
}: MapViewSectionProps) {
  const [participants, setParticipants] = useState<any[]>([]);
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [showModal, setShowModal] = useState(false);

  const checkLocationSharing = async () => {
    if (!appointmentTime) return;
    const diffMinutes = dayjs(appointmentTime).diff(dayjs(), 'minute');

    if (diffMinutes > 10) {
      setShowModal(true);
    } else {
      try {
        const res = await axiosInstance.get(`/appointments/${appointmentId}/locations`);
        setParticipants(res.data.result.participants);
      } catch (err) {
        console.error('❌ 위치 조회 실패:', err);
      }
    }
  };

  const fetchPlaces = async () => {
    try {
      const res = await axiosInstance.get(`/appointments/${appointmentId}/places`);
      setPlaces(res.data.result.places);
    } catch (err) {
      console.error('❌ 장소 목록 조회 실패:', err);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [appointmentId]);

  const KAKAO_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes" />
      <style>
        html, body, #map {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      </style>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false"></script>
      <script>
        window.onload = function () {
          kakao.maps.load(function () {
            var container = document.getElementById('map');
            var options = {
              center: new kakao.maps.LatLng(37.5665, 126.9780),
              level: 3
            };
            var map = new kakao.maps.Map(container, options);
            var marker = new kakao.maps.Marker({
              position: map.getCenter(),
              map: map
            });
          });
        };
      </script>
    </head>
    <body><div id="map"></div></body>
    </html>
  `;

  return (
    <View style={styles.wrapper}>
      <View style={styles.mapBox}>
        <WebView
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          javaScriptEnabled
          domStorageEnabled
          scrollEnabled={false}
          mixedContentMode="always"
          style={{ flex: 1, borderRadius: 10 }}
        />
      </View>

      <View style={styles.locationButtonWrapper}>
        <TouchableOpacity style={styles.locationButton} onPress={checkLocationSharing}>
          <Text style={styles.locationButtonText}>✅ 위치 체크</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.content}>
        <Text style={styles.title}>약속 장소</Text>
        {placeName && <Text style={styles.placeName}>📍 {placeName}</Text>}

        <View style={styles.placeListBox}>
          <Text style={styles.sectionTitle}>약속 장소 목록</Text>
          <Text style={styles.subText}>약속에서 방문할 장소들을 추가해보세요.</Text>
          {places.map((place, index) => (
            <View key={place.placeId}>
              <Text style={styles.listItem}>{index + 1}. {place.name}</Text>
              <Text style={styles.listItem}>{place.category} / {place.address}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <More10CheckModal visible={showModal} onClose={() => setShowModal(false)} />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  mapBox: {
    width: width * 0.9,
    alignSelf: 'center',
    height: 260,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  locationButtonWrapper: {
    marginTop: -33,
    alignItems: 'flex-end',
    paddingHorizontal: 30,
    zIndex: 10,
  },
  locationButton: {
    backgroundColor: Colors.white,
    borderRadius: 10,
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
  content: {
    padding: 20,
    gap: 14,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  placeListBox: {
    padding: 14,
    backgroundColor: Colors.background,
    borderRadius: 10,
    gap: 6,
  },
  listItem: {
    fontSize: 15,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subText: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
});
