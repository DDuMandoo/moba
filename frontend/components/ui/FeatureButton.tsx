import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface FeatureButtonProps {
  iconName: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}

const FeatureButton = ({ iconName, label, onPress }: FeatureButtonProps) => {
  const { width: screenWidth } = useWindowDimensions();

  const width = screenWidth * 0.29;
  const height = 40;
  const borderRadius = 10;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
        backgroundColor: Colors.white,
        borderColor: Colors.primary,
        borderWidth: 1,
        borderRadius,
        paddingHorizontal: 8,
      }}
    >
      <Feather
        name={iconName}
        size={16}
        color={Colors.primary}
        style={{ marginRight: 6 }}
      />
      <Text
        style={{
          color: Colors.primary,
          fontWeight: 'bold',
          fontSize: 13,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default FeatureButton;