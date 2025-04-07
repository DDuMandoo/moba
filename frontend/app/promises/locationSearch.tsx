// app/promises/PlaceSearchPage.tsx
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
  TouchableWithoutFeedback,
} from 'react-native';
import WebView from 'react-native-webview';
import Colors from '@/constants/Colors';
import axiosInstance from '@/app/axiosInstance';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DetailedMemoModal from '@/components/promises/DetaildMemoModal';

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
  const params = useLocalSearchParams<{ appointmentId?: string; mode?: 'create' | 'edit' | 'list'}>();
  const mode = params.mode;
  const appointmentId = params.appointmentId;

  const [searchKeyword, setSearchKeyword] = useState('');
  const [places, setPlaces] = useState<PlaceItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [memoModalVisible, setMemoModalVisible] = useState(false);
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
      const res = await axiosInstance.get(
        `/appointments/places/search?keyword=${encodeURIComponent(keyword)}${cursorId ? `&cursorId=${cursorId}` : ''}`
      );
      setPlaces(res.data.result.results);
      setModalVisible(true);
    } catch (err) {
      console.error('❌ 장소 검색 실패:', err);
    }
  };

  const handleSelectPlaceItem = (item: PlaceItem) => {
    setSelectedPlace(item);
    setModalVisible(false);
    const jsCode = `
      if (window.setCustomOverlay) {
        window.setCustomOverlay(${JSON.stringify(item)});
      }
    `;
    webViewRef.current?.injectJavaScript(jsCode);
  };

  const handleMemoConfirm = async () => {
    if (!selectedPlace) return;
  
    const routeParams = {
      selectedPlaceId: String(selectedPlace.placeId),
      selectedPlaceName: selectedPlace.name,
      selectedPlaceMemo: memoText,
    };
  
    if (mode === 'list' && appointmentId) {
      try {
        // memo 입력했더라도 그냥 장소만 추가하고 끝
        await axiosInstance.post(`/appointments/${appointmentId}/places/${selectedPlace.placeId}`);
        router.back(); // 다시 EditPlaceListModal로
      } catch (err) {
        console.error('❌ 장소 추가 실패:', err);
      }
      return;
    }
  
    if (mode === 'edit' && appointmentId) {
      router.replace(
        `/promises/${appointmentId}/edit?selectedPlaceId=${selectedPlace.placeId}&selectedPlaceName=${encodeURIComponent(selectedPlace.name)}&selectedPlaceMemo=${encodeURIComponent(memoText)}`
      );
    } else {
      router.replace({
        pathname: '/(bottom-navigation)/add',
        params: routeParams,
      });
    }
  };  
  
  const KAKAO_API_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY;
  const customMarkerImage = 'https://moba-image.s3.ap-northeast-2.amazonaws.com/profile/CustomMarker.png';
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
            width: 300px;
            height: 165px;
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
            padding: 7px 15px;
          }
          .overlayTitle {
            font-family: 'NanumSquare';
            font-weight: 400;
            font-size: 19px;
            line-height: 20px;
            color: #FFFFFF;
          }
          .overlayClose {
            width: 36px;
            height: 36px;
            border: none;
            background: transparent;
            font-size: 32px;
            color: #FFFFFF;
            cursor: pointer;
          }
          .overlayBody {
            padding: 12px 16px;
            display: flex;
            flex-direction: column;
            gap: 2px;
          }
          .overlayCategory {
            font-family: 'NanumSquare';
            font-weight: 400;
            font-size: 16px;
            line-height: 24px;
            color: #A47764;
          }
          .overlayAddress {
            font-family: 'NanumSquare';
            font-weight: 400;
            font-size: 16px;
            line-height: 25px;
            color: #333;
          }
          .overlayFooter {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .overlayDetail {
            font-family: 'NanumSquare';
            font-weight: 400;
            font-size: 16px;
            line-height: 16px;
            text-decoration: underline;
            color: #1570EF;
            cursor: pointer;
          }
          .selectBtn {
            width: 50px;
            height: 32px;
            border: 1px solid #431905;
            border-radius: 8px;
            background: transparent;
            font-family: 'NanumSquare';
            font-weight: 500;
            font-size: 14px;
            line-height: 16px;
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

            // 커스텀 마커 (80x80)
            var markerImgSrc = '${customMarkerImage}';
            var markerImgSize = new kakao.maps.Size(80, 80);
            var markerImgOption = { offset: new kakao.maps.Point(40, 80) };
            var markerImage = new kakao.maps.MarkerImage(markerImgSrc, markerImgSize, markerImgOption);
            var marker = new kakao.maps.Marker({
              position: latLng,
              image: markerImage
            });
            marker.setMap(map);
            map.panTo(latLng);

            // 커스텀 오버레이 생성 (yAnchor를 1.5로 설정하여 마커 위로 5 정도 더 띄움)
            var content = '<div class="customOverlay">' +
                            '<div class="overlayHeader">' +
                              '<span class="overlayTitle">' + place.name + '</span>' +
                              '<button class="overlayClose" onclick="removeOverlay()">×</button>' +
                            '</div>' +
                            '<div class="overlayBody">' +
                              '<div class="overlayCategory">' + place.category + '</div>' +
                              '<div class="overlayAddress">' + place.address + '</div>' +
                              '<div class="overlayFooter">' +
                                '<div class="overlayDetail" onclick="window.open(\\'' + place.kakaoUrl + '\\', \\'' + '_blank\\')">상세정보 보기</div>' +
                                '<button class="selectBtn" onclick="selectPlace()">선택</button>' +
                              '</div>' +
                            '</div>' +
                            '<div class="arrow"></div>' +
                          '</div>';

            var overlayDiv = document.createElement('div');
            overlayDiv.innerHTML = content;
            var customOverlay = new kakao.maps.CustomOverlay({
              position: latLng,
              content: overlayDiv,
              xAnchor: 0.5,
              yAnchor: 1.5
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

  const handleOnMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'SELECT_PLACE') {
        const selected = {
          placeId: data.placeId,
          name: data.name,
          address: data.address,
          category: data.category,
          latitude: data.latitude,
          longitude: data.longitude,
          kakaoUrl: data.kakaoUrl,
        };
  
        if (mode === 'list' && appointmentId) {
          try {
            await axiosInstance.post(`/appointments/${appointmentId}/places/${selected.placeId}`);
            router.back(); // 모달 복귀
          } catch (err) {
            console.error('❌ 장소 추가 실패:', err);
          }
          return; // 🚨 이거 꼭 있어야 함!
        }
  
        // 이 아래는 create/edit 용
        setSelectedPlace(selected);
        setMemoModalVisible(true);
      }
    } catch (error) {
      console.error('onMessage 파싱 실패:', error);
    }
  };  

  return (
    <View style={styles.wrapper}>
      {/* Map WebView */}
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
      {/* Search box */}
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
      {/* Search results modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContainer}>
              <FlatList
                data={places}
                keyExtractor={(item) => item.placeId.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[
                      styles.placeItem,
                      index !== places.length - 1 && styles.itemSeparator,
                    ]}
                    onPress={() => handleSelectPlaceItem(item)}
                    activeOpacity={0.9}
                  >
                    <View style={styles.placeItemInner}>
                      <Text style={styles.placeName}>{item.name}</Text>
                      <Text style={styles.placeCategory}>{item.category}</Text>
                      <Text style={styles.placeAddress}>{item.address}</Text>
                    </View>
                    <Ionicons name="location-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  searchKeyword ? (
                    <Text style={styles.emptyText}>검색 결과가 없습니다.</Text>
                  ) : (
                    <Text style={styles.emptyText}>장소를 검색해주세요.</Text>
                  )
                }
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      {/* Detailed Memo Modal */}
      <DetailedMemoModal
        visible={memoModalVisible}
        memo={memoText}
        setMemo={setMemoText}
        selectedPlaceName={selectedPlace?.name}
        selectedPlaceCategory={selectedPlace?.category}
        selectedPlaceAddress={selectedPlace?.address}
        onConfirm={handleMemoConfirm}
        onClose={() => setMemoModalVisible(false)}
      />
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
    zIndex: 10,
  },
  searchBox: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderColor: Colors.logo,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    elevation: 3,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  input: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
    zIndex: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    maxHeight: SCREEN_WIDTH * 1.2,
  },
  listContent: { paddingBottom: 0 },
  placeItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemSeparator: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 4,
  },
  placeItemInner: { flex: 1, marginRight: 8 },
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
  emptyText: {
    textAlign: 'center',
    color: Colors.grayDarkText,
    marginTop: 20,
    fontSize: 14,
  },
});
