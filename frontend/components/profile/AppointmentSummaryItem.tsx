import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

interface AppointmentSummaryItemProps {
  name: string;
  imageUri: string;
  participantProfileImages: string[];
  size?: number; // default: 60
}

export default function AppointmentSummaryItem({
  name,
  imageUri,
  participantProfileImages,
  size = 60,
}: AppointmentSummaryItemProps) {
  const imageSize = size;
  const profileSize = size * 0.45;
  const maxProfiles = 10;

  return (
    <View style={[styles.container, { height: size }]}>
      <View
        style={[
          styles.imageBox,
          {
            width: imageSize,
            height: imageSize,
            borderRadius: imageSize * 0.3,
          },
        ]}
      >
        <Image
          source={
            imageUri
              ? { uri: imageUri }
              : require('@/assets/images/defaultpromise.png')
          }
          style={{
            width: '100%',
            height: '100%',
            borderRadius: imageSize * 0.25,
          }}
          resizeMode="cover"
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.name, { fontSize: size * 0.36 }]}>
          {name}
        </Text>

        <View style={styles.participantRow}>
          {participantProfileImages.slice(0, maxProfiles).map((uri, idx) => (
            <Image
              key={idx}
              source={
                uri && uri.trim() !== ""
                    ? { uri }
                    : require('@/assets/images/defaultprofile.png')
              }
              style={{
                width: profileSize,
                height: profileSize,
                borderRadius: profileSize * 0.3,
                borderWidth: 2,
                borderColor: Colors.white,
                backgroundColor: Colors.white,
                marginRight: 2,
              }}
              resizeMode="cover"
            />
          ))}
          {participantProfileImages.length > maxProfiles && (
            <Text
              style={[
                styles.moreText,
                { fontSize: size * 0.25, marginLeft: 6 },
              ]}
            >
              +{participantProfileImages.length - maxProfiles}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    width: '90%',
  },
  imageBox: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.logoInner,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: Colors.black,
    fontFamily: 'NanumSquareRound',
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    overflow: 'visible',
  },
  moreText: {
    color: Colors.grayDarkText,
    fontFamily: 'NanumSquareRound',
  },
});
