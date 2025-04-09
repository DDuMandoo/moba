import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ImageBackground,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  ScrollView,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Ionicons,
  Entypo,
  FontAwesome5,
  Feather,
} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/redux/hooks';
import axiosInstance from '@/app/axiosInstance';
import Colors from '@/constants/Colors';
import dayjs from 'dayjs';
import { ParticipantProfile } from '@/components/profile/ParticipantProfile';
import MapViewSection from '@/components/promises/MapViewSection';

const TOP_IMAGE_HEIGHT = 280;
const { width } = Dimensions.get('window');

export default function EndedAppointmentPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAppSelector((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastData, setToastData] = useState<{
    name: string;
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastWidth, setToastWidth] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [appointmentRes, imageRes, placeRes] = await Promise.all([
          axiosInstance.get(`/appointments/${id}`),
          axiosInstance.get(`/appointments/${id}/images?size=3`),
          axiosInstance.get(`/appointments/${id}/places`),
        ]);
        setAppointment(appointmentRes.data.result);
        setImages(imageRes.data.result.images);
        setPlaces(placeRes.data.result.places);
      } catch (err) {
        console.error('❌ 데이터 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleParticipantPress = (
    name: string,
    x: number,
    y: number,
    boxWidth: number,
    boxHeight: number
  ) => {
    setToastData({ name, x, y, width: boxWidth, height: boxHeight });
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => setToastData(null));
      }, 2000);
    });
  };

  if (loading || !appointment) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: appointment.imageUrl }}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
      </ImageBackground>

      <View style={styles.whiteBox}>
        
        <View style={styles.infoBox}>
          <Text style={styles.title}>{appointment.name}</Text>
          <View style={styles.detailRow}>
            <Feather name="calendar" size={18} color={Colors.primary} style={{ marginRight: 2 }} />
            <Text style={styles.detailText}>{dayjs(appointment.time).format('YYYY년 M월 D일 HH:mm')}</Text>
          </View>
          <View style={styles.detailRow}>
            <FontAwesome5 name="map-marker-alt" size={18} color={Colors.primary} style={{ marginRight: 2 }} />
            <Text style={styles.detailText}>
              {appointment.placeName ? (
                <Text style={styles.detailText}>
                  {appointment.placeName}
                  {appointment.memo ? `\n${appointment.memo}` : ''}
                </Text>
              ) : (
                <Text style={{ fontStyle: 'italic', color: Colors.grayLightText, fontSize: 14 }}>
                  선택한 장소가 없습니다.
                </Text>
              )}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={18} color={Colors.primary} style={{ marginRight: 2 }} />
            {appointment.participants?.length > 0 ? (
              <FlatList
                horizontal
                data={appointment.participants}
                keyExtractor={(item) => String(item.memberId)}
                contentContainerStyle={{ gap: 5 }}
                renderItem={({ item }) => (
                  <ParticipantProfile item={item} onPress={handleParticipantPress} />
                )}
              />
            ) : (
              <Text style={{ fontStyle: 'italic', color: Colors.grayLightText }}>
                선택한 참가자가 없습니다.
              </Text>
            )}
          </View>
        </View>
            <ScrollView showsVerticalScrollIndicator={false}>

              <View style={styles.galleryWrapper}>
                <TouchableOpacity onPress={() => router.push(`/promises/${id}/gallery?ended=true`)}>
                  <View style={styles.galleryHeader}>
                    <Text style={styles.galleryTitle}>갤러리</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                  </View>
                  <View style={styles.galleryBox}>
                    {images.length > 0 ? (
                      <FlatList
                        horizontal
                        data={images}
                        keyExtractor={(item) => String(item.imageId)}
                        renderItem={({ item }) => (
                          <Image source={{ uri: item.imageUrl }} style={styles.galleryImage} />
                        )}
                        contentContainerStyle={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          flexGrow: 1,
                        }}
                        showsHorizontalScrollIndicator={false}
                      />
                    ) : (
                      <Text style={styles.noImageText}>약속 사진이 없어요.</Text>
                    )}
                  </View>
                </TouchableOpacity>
              </View>

              {/* ✅ 지도 섹션 */}
              <View style={{ marginTop: 24 }}>
                <MapViewSection
                  appointmentId={appointment.appointmentId}
                  placeId={appointment.placeId}
                  placeName={appointment.placeName}
                  isHost={false}
                  appointmentTime={appointment.time}
                  isEnded={true}
                />
              </View>
            </ScrollView>
      </View>

      {toastData && (
        <Animated.View
          onLayout={(e) => setToastWidth(e.nativeEvent.layout.width)}
          style={[
            styles.toastContainer,
            {
              left: toastData.x + toastData.width / 2,
              top: toastData.y - 35,
              opacity: toastOpacity,
              transform: [{ translateX: -toastWidth / 2 }],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastData.name}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: TOP_IMAGE_HEIGHT,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233,217,197,0.7)',
  },
  whiteBox: {
    position: 'absolute',
    top: TOP_IMAGE_HEIGHT / 2,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
    paddingTop: 10,
  },
  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 16,
    color: Colors.primary,
    padding: 2
  },
  galleryWrapper: {
    marginTop: 20,
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: '5%',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  galleryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  galleryBox: {
    height: 130,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  galleryImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 8,
  },
  noImageText: {
    fontSize: 16,
    color: Colors.grayDarkText,
    fontStyle: 'italic',
    marginLeft: 10,
  },
  toastContainer: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: Colors.logoInner,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 5,
    elevation: 3,
  },
  toastText: {
    fontSize: 10,
    color: Colors.primary,
  },
});