// components/promises/MapViewSection.tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LocationCard from './LocationCard';

interface Location {
  title: string;
  memo?: string;
  order: number;
}

interface MapViewSectionProps {
  latitude: number;
  longitude: number;
  places: Location[];
  isHost?: boolean;
}

const MapViewSection: React.FC<MapViewSectionProps> = ({ latitude, longitude, places, isHost = false }) => {
  return (
    <View className="px-4 pt-5 pb-10 bg-white">
      {/* 지도 영역 - 실제 카카오맵으로 대체 예정 */}
      <View className="h-64 bg-gray-200 rounded-2xl overflow-hidden mb-4 items-center justify-center">
        <Text className="text-gray-500">카카오맵 표시 예정 (lat: {latitude}, lng: {longitude})</Text>
      </View>

      {/* 위치 체크 버튼 */}
      <TouchableOpacity
        onPress={() => console.log('📍 위치 체크')}
        className="flex-row items-center justify-center gap-1 bg-white px-4 py-2 border border-gray-300 rounded-xl self-end mb-4"
      >
        <Ionicons name="checkbox-outline" size={16} color="#8c8c8c" />
        <Text className="text-gray-600 text-sm">위치 체크</Text>
      </TouchableOpacity>

      {/* 장소 카드 리스트 */}
      <Text className="text-lg font-semibold mb-2">약속 장소 목록</Text>

      {places.map((place) => (
        <LocationCard key={place.order} order={place.order} title={place.title} memo={place.memo} />
      ))}

      {isHost && (
        <TouchableOpacity
          onPress={() => console.log('✏️ 장소 목록 수정')}
          className="flex-row items-center justify-center border border-gray-300 rounded-xl py-2 mt-3"
        >
          <Ionicons name="create-outline" size={16} color="#8c8c8c" />
          <Text className="text-gray-600 text-sm ml-1">장소 목록 수정</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MapViewSection;
