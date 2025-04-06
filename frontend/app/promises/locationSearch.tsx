import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback
} from 'react-native';
import WebView from 'react-native-webview';
import Colors from '@/constants/Colors';
import axiosInstance from '@/app/axiosInstance';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface PlaceItem {
  placeId: number;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  kakaoUrl: string;
}

export default function PlaceSearchPage() {
  const router = useRouter();
  // 쿼리 파라미터: appointmentId, mode (여기서는 mode를 "create"로 고정)
  const params = useLocalSearchParams<{ appointmentId?: string; mode?: string }>();
  const appointmentId = params.appointmentId;
  const mode: 'create' = 'create';

  const [searchKeyword, setSearchKeyword] = useState('');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false); // 검색 결과 모달
  const [memoModalVisible, setMemoModalVisible] = useState(false); // 메모 모달
  const [memoText, setMemoText] = useState('');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    console.log('🚀 appointmentId:', appointmentId, 'mode:', mode);
  }, [appointmentId, mode]);

  const fetchPlaces = async (keyword: string, cursorId?: number) => {
    if (!keyword.trim()) {
      console.log('🚫 검색어 없음');
      return;
    }
    try {
      console.log(`📡 검색 요청: ${keyword}`);
      const res = await axiosInstance.get(
        `/appointments/places/search?keyword=${encodeURIComponent(keyword)}${cursorId ? `&cursorId=${cursorId}` : ''}`
      );
      console.log('📍 검색 결과:', res.data.result.results);
      setPlaces(res.data.result.results);
      setModalVisible(true);
    } catch (err) {
      console.error('❌ 장소 검색 실패:', err);
    }
  };

  // 장소 리스트 아이템 선택 시: 모달을 닫고 WebView에 JS 주입하여 커스텀 오버레이 생성
  const handleSelectPlaceItem = (item: PlaceItem) => {
    if (mode === 'create') {
      setSelectedPlace(item);
      setModalVisible(false);
      const jsCode = `
        if (window.setCustomOverlay) {
          window.setCustomOverlay(${JSON.stringify(item)});
        }
      `;
      webViewRef.current?.injectJavaScript(jsCode);
    }
  };

  // 메모 모달에서 확인 누르면 약속 생성(수정) 페이지로 이동하면서 정보 전달
  const handleMemoConfirm = () => {
    if (!selectedPlace) return;
    router.replace({
      pathname: '/(bottom-navigation)/add',
      params: {
        selectedPlaceId: String(selectedPlace.placeId),
        selectedPlaceName: selectedPlace.name,
        selectedPlaceMemo: memoText,
      },
    });
  };

  // Kakao Maps HTML (WebView)
  const KAKAO_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
          .customOverlay {
            position: relative;
            width: 380px;
            height: 230px;
            background: #FFFFFF;
            box-shadow: 0px 4px 4px rgba(0,0,0,0.25);
            border-radius: 10px;
          }
          .overlayHeader {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #B29486;
            border-radius: 10px 10px 0 0;
            padding: 11px 20px;
          }
          .overlayTitle {
            font-family: 'NanumSquare';
            font-weight: 700;
            font-size: 32px;
            line-height: 36px;
            color: #FFFFFF;
          }
          .overlayClose {
            width: 48px;
            height: 48px;
            border: none;
            background: transparent;
            font-size: 32px;
            color: #FFFFFF;
            cursor: pointer;
          }
          .overlayBody {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .overlayCategory {
            font-family: 'NanumSquare';
            font-weight: 400;
            font-size: 20px;
            line-height: 30px;
            color: #A47764;
          }
          .overlayAddress {
            font-family: 'NanumSquare';
            font-weight: 400;
            font-size: 20px;
            line-height: 23px;
            color: #333;
          }
          .overlayDetail {
            font-family: 'NanumSquare';
            font-weight: 400;
            font-size: 20px;
            line-height: 23px;
            text-decoration: underline;
            color: #1570EF;
            cursor: pointer;
          }
          .selectBtn {
            width: 80px;
            height: 50px;
            border: 1px solid #431905;
            border-radius: 10px;
            background: transparent;
            font-family: 'NanumSquare';
            font-weight: 700;
            font-size: 20px;
            line-height: 23px;
            color: #000000;
            cursor: pointer;
          }
          .arrow {
            position: absolute;
            left: 50%;
            bottom: -10px;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-top: 10px solid #FFFFFF;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
          }
        </style>
        <script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}&autoload=false"></script>
        <script>
          let map;
          window.onload = function () {
            kakao.maps.load(function () {
              var container = document.getElementById('map');
              var options = {
                center: new kakao.maps.LatLng(37.5665, 126.9780),
                level: 3
              };
              map = new kakao.maps.Map(container, options);
            });
          };
          window.setCustomOverlay = function(place) {
            var latLng = new kakao.maps.LatLng(place.latitude, place.longitude);
            // 기본 마커 생성
            var marker = new kakao.maps.Marker({ position: latLng });
            marker.setMap(map);
            map.panTo(latLng);
            // 커스텀 오버레이 생성
            var content = '<div class="customOverlay">' +
                            '<div class="overlayHeader">' +
                              '<span class="overlayTitle">' + place.name + '</span>' +
                              '<button class="overlayClose" onclick="removeOverlay()">×</button>' +
                            '</div>' +
                            '<div class="overlayBody">' +
                              '<div class="overlayCategory">' + place.category + '</div>' +
                              '<div class="overlayAddress">' + place.address + '</div>' +
                              '<div class="overlayDetail" onclick="window.open(\\'' + place.kakaoUrl + '\\', \\'' + '_blank\\')">상세정보 보기</div>' +
                              '<button class="selectBtn" onclick="selectPlace()">선택</button>' +
                            '</div>' +
                            '<div class="arrow"></div>' +
                          '</div>';
            var overlayDiv = document.createElement('div');
            overlayDiv.innerHTML = content;
            var customOverlay = new kakao.maps.CustomOverlay({
              position: latLng,
              content: overlayDiv,
              xAnchor: 0.5,
              yAnchor: 1.2
            });
            customOverlay.setMap(map);
            window.currentOverlay = customOverlay;
            window.selectPlace = function() {
              var data = {
                type: 'SELECT_PLACE',
                placeId: place.placeId,
                name: place.name,
                address: place.address,
                category: place.category,
                latitude: place.latitude,
                longitude: place.longitude,
                kakaoUrl: place.kakaoUrl
              };
              window.ReactNativeWebView.postMessage(JSON.stringify(data));
            };
            window.removeOverlay = function() {
              if (window.currentOverlay) {
                window.currentOverlay.setMap(null);
              }
            };
          };
        </script>
      </head>
      <body><div id="map"></div></body>
    </html>
  `;

  const handleOnMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PLACE') {
        setSelectedPlace({
          placeId: data.placeId,
          name: data.name,
          address: data.address,
          category: data.category,
          latitude: data.latitude,
          longitude: data.longitude,
          kakaoUrl: data.kakaoUrl,
        });
        if (mode === 'create') {
          setMemoModalVisible(true);
        }
      }
    } catch (error) {
      console.error('onMessage 파싱 실패:', error);
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* 지도 WebView */}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: mapHtml }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        mixedContentMode="always"
        style={StyleSheet.absoluteFill}
        onMessage={handleOnMessage}
      />

      {/* 검색창 */}
      <SafeAreaView style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.searchBox}>
            <TextInput
              placeholder="장소를 검색해주세요."
              placeholderTextColor={Colors.grayLightText}
              style={styles.input}
              value={searchKeyword}
              onChangeText={setSearchKeyword}
              onSubmitEditing={() => fetchPlaces(searchKeyword)}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={() => fetchPlaces(searchKeyword)}>
              <Ionicons name="search" size={20} color={Colors.logo} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* 검색 결과 모달 */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContainer}>
              <FlatList
                data={places}
                keyExtractor={(item) => item.placeId.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.placeItem}
                    onPress={() => handleSelectPlaceItem(item)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.placeItemInner}>
                      <Text style={styles.placeName}>{item.name}</Text>
                      <Text style={styles.placeCategory}>{item.category} · {item.address}</Text>
                    </View>
                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  searchKeyword
                    ? <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                    : <Text style={styles.emptyText}>장소를 검색해주세요.</Text>
                }
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* 메모 모달 */}
      <Modal visible={memoModalVisible} transparent animationType="slide">
        <View style={styles.memoModalWrapper}>
          <View style={styles.memoContainer}>
            <Text style={styles.memoTitle}>상세 장소 메모 (선택)</Text>
            <TextInput
              style={styles.memoInput}
              placeholder="예) 이 카페 2층이 예뻐요"
              placeholderTextColor={Colors.grayLightText}
              value={memoText}
              onChangeText={setMemoText}
              multiline
            />
            <TouchableOpacity style={styles.confirmButton} onPress={handleMemoConfirm}>
              <Text style={styles.confirmText}>확인</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderColor: Colors.logo,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
    elevation: 3,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: { fontSize: 15, color: Colors.text, flex: 1 },
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
  listContent: { paddingBottom: 80 },
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
  memoTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  memoInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
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
