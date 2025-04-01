// components/ProfileWithEmail.tsx
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface ProfileWithEmailProps {
  name: string;
  email: string;
  imageUri: string;
}

export default function ProfileWithEmail({ name, email, imageUri }: ProfileWithEmailProps) {
  const emailId = email.split('@')[0];

  return (
    <View style={styles.container}>
      <View style={styles.imageBox}>
        <Image
          source={imageUri ? { uri: imageUri } : require('@/assets/images/default-profile.png')}
          style={styles.image}
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name} 님</Text>
        <Text style={styles.emailId}>@{emailId}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    height: 68,
  },
  imageBox: {
    width: 68,
    height: 68,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.logo,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  textContainer: {
    height: 68,
    justifyContent: 'center',
  },
  name: {
    fontSize: 28,
    color: Colors.black,
    fontFamily: 'NanumSquareRound',
  },
  emailId: {
    fontSize: 20,
    color: Colors.grayDarkText,
    fontFamily: 'NanumSquareRound',
  },
});
