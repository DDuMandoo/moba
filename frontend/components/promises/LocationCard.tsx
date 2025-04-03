// components/promises/LocationCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface LocationCardProps {
  order: number;
  title: string;
  memo?: string;
}

const LocationCard: React.FC<LocationCardProps> = ({ order, title, memo }) => {
  return (
    <View className="flex-row items-center bg-[#F9F9F9] border border-gray-200 rounded-xl px-4 py-3 mb-3">
      <View className="w-7 h-7 rounded-md bg-[#EEE5DA] justify-center items-center mr-3">
        <Text className="text-sm text-brown-700 font-semibold">{order}</Text>
      </View>
      <View>
        <Text className="text-base font-medium text-gray-800">{title}</Text>
        {memo && <Text className="text-sm text-gray-500">{memo}</Text>}
      </View>
    </View>
  );
};

export default LocationCard;
