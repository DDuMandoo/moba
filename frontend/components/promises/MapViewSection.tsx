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
  const [routeMapHtml, setRouteMapHtml] = useState('');
  const ws = useRef<WebSocket | null>(null);
  const router = useRouter();
  const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

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
      console.log(res.data.result);
      const participants = res.data.result.participants;
      console.log('위치 공유 참여자:', participants);
      setParticipants(participants);
      generateMapWithParticipants(participants);
    } catch (err) {
      console.error('❌ 위치 조회 실패:', err);
    }
  };
  
  const generateMapWithParticipants = (participantList: any[]) => {
    const defaultImage = "https://moba-image.s3.ap-northeast-2.amazonaws.com/profile/%EB%A7%88%EC%BB%A4.png";
  
    const participantMarkers = participantList
      .map((p) => {
        const imgUrl = p.memberImage ?? defaultImage;
        const name = p.memberName ?? '이름 없음';
        return `
          const pos = new kakao.maps.LatLng(${p.latitude}, ${p.longitude});
          bounds.extend(pos);
          const content = \`
            <div style="text-align:center;">
              <img src="${imgUrl}" style="width:64px;height:64px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3);" />
              <div style="margin-top:4px;padding:4px 8px;background:#431905;color:white;border-radius:8px;font-size:13px;font-weight:bold;">
                ${name}
              </div>
            </div>
          \`;
          new kakao.maps.CustomOverlay({
            map,
            position: pos,
            content: content,
            yAnchor: 1
          });
        `;
      })
      .join('\n');
  
      const mapHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>
            html, body, #map {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
            }
          </style>
          <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.EXPO_PUBLIC_KAKAO_JS_KEY}&autoload=false"></script>
          <script>
            window.onload = function () {
              kakao.maps.load(function () {
                const map = new kakao.maps.Map(document.getElementById('map'), {
                  center: new kakao.maps.LatLng(37.5665, 126.9780),
                  level: 5
                });

                const bounds = new kakao.maps.LatLngBounds();
                let lastPos = null;

                ${participantMarkers}

                if (participantList.length === 1) {
  const single = participantList[0];
  const pos = new kakao.maps.LatLng(single.latitude, single.longitude);
  map.setLevel(3);
  map.setCenter(pos);
} else {
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  const latDiff = Math.abs(ne.getLat() - sw.getLat());
  const lngDiff = Math.abs(ne.getLng() - sw.getLng());

  if (latDiff < 0.0001 && lngDiff < 0.0001) {
    const center = bounds.getCenter();
    map.setLevel(3);
    map.setCenter(center);
  } else {
    map.setBounds(bounds);
  }
}
              });
            };
          </script>
        </head>
        <body>
          <div id="map"></div>
        </body>
        </html>
        `;
    setRouteMapHtml(mapHtml);
  }; 

  const connectWebSocket = async () => {
    const accessToken = await getAccessToken(); // ⬅️ accessToken 가져오기
  
    ws.current = new WebSocket(
    `wss://j12a601.p.ssafy.io/api/ws/location?appointmentId=${appointmentId}&token=${accessToken}`
  );

  ws.current.onopen = () => {
    console.log('✅ WebSocket 연결됨');
  };
  
    ws.current.onmessage = async (e) => {
      const message = JSON.parse(e.data);
      console.log('📩 WebSocket 메시지 수신:', message);
  
      if (message.type === 'request_location') {
        console.log('📡 위치 요청 수신 (from server)');
  
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('⛔ 위치 권한 거부됨');
          return;
        }
  
        const location = await Location.getCurrentPositionAsync({});
        const payload = {
          memberId: profile?.memberId,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
  
        console.log('📍 내 위치 전송:', payload);
        ws.current?.send(JSON.stringify(payload));
      }
    };
  
    ws.current.onerror = (e) => {
      console.error('❌ WebSocket 에러:', e);
    };
  
    ws.current.onclose = () => {
      console.log('🛑 WebSocket 연결 종료');
    };
  };  

  const generateDefaultMap = () => {
    const mapHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }</style>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.EXPO_PUBLIC_KAKAO_JS_KEY}&autoload=false"></script>
        <script>
          window.onload = function () {
            kakao.maps.load(function () {
              const map = new kakao.maps.Map(document.getElementById('map'), {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 7
              });
            });
          };
        </script>
      </head>
      <body><div id="map"></div></body>
      </html>`;
    setRouteMapHtml(mapHtml);
  };

  const generateMapWithRoute = async () => {
    if (places.length < 2) return;

    let polylineScripts = '';
    for (let i = 0; i < places.length - 1; i++) {
      const origin = `${places[i].longitude},${places[i].latitude}`;
      const destination = `${places[i + 1].longitude},${places[i + 1].latitude}`;

      const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}`;

      try {
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await res.json();

        const lineCoords: string[] = [];
        data.routes[0].sections[0].roads.forEach((road: any) => {
          for (let j = 0; j < road.vertexes.length; j += 2) {
            const lat = road.vertexes[j + 1];
            const lng = road.vertexes[j];
            lineCoords.push(`new kakao.maps.LatLng(${lat}, ${lng})`);
          }
        });

        polylineScripts += `
          const linePath${i} = [${lineCoords.join(',')}];
          new kakao.maps.Polyline({
            map,
            path: linePath${i},
            strokeWeight: 6,
            strokeColor: '	#FF0081	',
            strokeOpacity: 0.8,
            strokeStyle: 'solid'
          });
        `;
      } catch (err) {
        console.error('경로 가져오기 실패', err);
      }
    }

    const mapHtml = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <style>
        html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
      </style>
      <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.EXPO_PUBLIC_KAKAO_JS_KEY}&autoload=false"></script>
      <script>
        const places = ${JSON.stringify(places)};
        window.onload = function () {
          kakao.maps.load(function () {
            const map = new kakao.maps.Map(document.getElementById('map'), {
              center: new kakao.maps.LatLng(37.5665, 126.9780),
              level: 7
            });
    
            const bounds = new kakao.maps.LatLngBounds();
            places.forEach((place, idx) => {
              const pos = new kakao.maps.LatLng(place.latitude, place.longitude);
              bounds.extend(pos);
              new kakao.maps.Marker({
                position: pos,
                map,
                image: new kakao.maps.MarkerImage(
                  "https://moba-image.s3.ap-northeast-2.amazonaws.com/profile/CustomMarker.png",
                  new kakao.maps.Size(80, 80),
                  { offset: new kakao.maps.Point(40, 80) }
                )
              });
              new kakao.maps.CustomOverlay({
                content: '<div style="background:#fff;padding:2px 6px;border-radius:4px;border:1px solid #666;font-size:16px;">' + (idx + 1) + '</div>',
                position: pos,
                yAnchor: 1
              }).setMap(map);
            });
    
            ${polylineScripts}
    
            map.setBounds(bounds);
          });
        };
      </script>
    </head>
    <body>
      <div id="map"></div>
    </body>
    </html>`;

    setRouteMapHtml(mapHtml);
  };

  useEffect(() => {
    generateDefaultMap();
  }, []);  

  useFocusEffect(
    useCallback(() => {
      fetchPlaces();
      const diffMinutes = dayjs(appointmentTime).diff(dayjs(), 'minute');
      console.log(diffMinutes)
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
          originWhitelist={['*']}
          source={{ html: routeMapHtml }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowFileAccess={true}
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
                  <TouchableOpacity style={styles.iconButtonSmall} onPress={async () => {
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
        onSave={(updated) => {
          fetchPlaces();
        }}
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
  listItem: {
    fontSize: 15,
    color: '#333',
  },
  placeListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
});
