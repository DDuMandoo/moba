import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import axiosInstance from '@/app/axiosInstance';

interface Participant {
  memberId: number;
  name: string;
  profileImage: string | null;
}

interface Props {
  imageUrl: string;
  title: string;
  time: string;
  location?: string;
  amount?: string;
  appointmentId: number;
  onPress?: () => void;
  participants?: { profileImage: string | null }[]; // ✅ 여기를 추가

}

export default function PromiseCard({
  imageUrl,
  title,
  time,
  location,
  amount,
  appointmentId,
  onPress,
}: Props) {
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        const res = await axiosInstance.get(`/appointments/${appointmentId}/participants`);
        const participants = res.data.result?.participants ?? [];
        setParticipants(participants);
        console.log('✅ 참가자 목록:', participants);
      } catch (err: any) {
        console.error('❌ 참가자 정보 로딩 실패:', err?.response?.data || err.message);
      }
    };
  
    fetchParticipants();
  }, [appointmentId]);
  
  

  const displayExtraInfo = location || amount;

  let formattedTime = '-';
  try {
    const date = new Date(time);
    if (!isNaN(date.getTime())) {
      formattedTime = date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    }
  } catch {}

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
        <Image source={{ uri: imageUrl }} style={styles.image} />

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.metaRow}>
            <Feather name="clock" size={16} color={Colors.black} />
            <Text style={styles.metaText}>{formattedTime}</Text>
          </View>

          {displayExtraInfo && (
            <View style={styles.metaRow}>
              <Feather
                name={location ? 'map' : 'credit-card'}
                size={16}
                color={Colors.black}
              />
              <Text style={styles.metaText}>
                {location ? location : `${Number(amount).toLocaleString()}원`}
              </Text>
            </View>
          )}

          <View style={styles.participantsRow}>
            <Feather name="users" size={16} color={Colors.black} />
            <View style={styles.profileGroup}>
              {participants.map((p, index) => (
                <Image
                  key={p.memberId ?? index}
                  source={
                    p.profileImage
                      ? { uri: p.profileImage }
                      : require('@/assets/images/defaultprofile.png')
                  }
                  style={styles.profileImage}
                />
              ))}
            </View>
          </View>
        </View>

        <Feather name="chevron-right" size={20} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 12,
    backgroundColor: Colors.white,
    padding: 10,
    marginBottom: 12,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 10,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.black,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaText: {
    fontSize: 14,
    color: Colors.black,
    marginLeft: 6,
    lineHeight: 18,
    textAlignVertical: 'center',
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  profileGroup: {
    flexDirection: 'row',
    marginLeft: 6,
    gap: 5,
  },
  profileImage: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 0.4,
    borderColor: Colors.logo,
    backgroundColor: Colors.grayLightText,
  },
});
