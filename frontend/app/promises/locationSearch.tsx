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

const NETLIFY_BASE_URL = 'https://storied-chaja-c0f82a.netlify.app';

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
  const [mapUrl, setMapUrl] = useState(`${NETLIFY_BASE_URL}/default.html`);
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    // selectedPlace가 없을 경우 기본 지도 보여줌
    if (!selectedPlace) {
      setMapUrl(`${NETLIFY_BASE_URL}/default.html`);
    }
  }, [selectedPlace]);

  
  useEffect(() => {
  }, [appointmentId, mode]);

  const fetchPlaces = async (keyword: string, cursorId?: number) => {
    if (!keyword.trim()) {
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
    const dataParam = encodeURIComponent(JSON.stringify(item));
    setMapUrl(`${NETLIFY_BASE_URL}/place.html?data=${dataParam}`);
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
        await axiosInstance.post(`/appointments/${appointmentId}/places/${selectedPlace.placeId}`);
        router.back();
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
            router.back();
          } catch (err) {
            console.error('❌ 장소 추가 실패:', err);
          }
          return;
        }

        setSelectedPlace(selected);
        setMemoModalVisible(true);
      }
    } catch (error) {
      console.error('onMessage 파싱 실패:', error);
    }
  };

  return (
    <View style={styles.wrapper}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ uri: mapUrl }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        mixedContentMode="always"
        style={StyleSheet.absoluteFill}
        onMessage={handleOnMessage}
      />

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

      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalWrapper}>
            <View style={styles.modalContainer}>
              <FlatList
                data={places}
                keyExtractor={(item) => item.placeId.toString()}
                renderItem={({ item, index }) => (
                  <TouchableOpacity
                    style={[styles.placeItem, index !== places.length - 1 && styles.itemSeparator]}
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
