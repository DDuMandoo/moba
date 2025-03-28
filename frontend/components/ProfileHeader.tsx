import React, { useState } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import Colors from '@/constants/Colors';

interface Props {
  name: string;
  image: string;
  isLoading: boolean;
  isError: boolean;
}

export default function ProfileHeader({ name, image, isLoading, isError }: Props) {
  const [imgError, setImgError] = useState(false);

  if (isLoading) {
    return <ActivityIndicator color={Colors.primary} />;
  }

  if (isError || !name) {
    return (
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: Colors.grayDarkText }}>
        유저 정보를 불러올 수 없습니다.
      </Text>
    );
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
      <Image
        source={
          !image || imgError
            ? require('@/assets/images/default-profile.png')
            : { uri: image }
        }
        onError={() => setImgError(true)}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: Colors.grayLightText,
          marginRight: 12,
        }}
      />
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors.text }}>
        {name} 님의 지갑
      </Text>
    </View>
  );
}
