import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Ionicons,
  Entypo,
  MaterialIcons,
  FontAwesome5,
  Feather,
} from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/redux/hooks';
import axiosInstance from '@/app/axiosInstance';
import Colors from '@/constants/Colors';
import MapViewSection from '@/components/promises/MapViewSection';
import InterestViewSection from '@/components/promises/InterestViewSection';
import dayjs from 'dayjs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const TOP_IMAGE_HEIGHT = 280;

export default function AppointmentDetailPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAppSelector((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'map' | 'interest'>('map');

  const translateY = useSharedValue(-TOP_IMAGE_HEIGHT / 2);
  const HEADER_MARGIN = insets.top + 60;
  const minTranslateY = -TOP_IMAGE_HEIGHT + HEADER_MARGIN;
  const maxTranslateY = 0;

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateY.value = Math.max(
        minTranslateY,
        Math.min(maxTranslateY, translateY.value + event.translationY)
      );
    },
    onEnd: () => {
      translateY.value = withSpring(
        translateY.value < minTranslateY / 2 ? minTranslateY : maxTranslateY,
        { damping: 20 }
      );
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const dynamicHeight = SCREEN_HEIGHT - translateY.value;
    return {
      transform: [{ translateY: translateY.value }],
      height: dynamicHeight,
    };
  });

  const getAppointment = async () => {
    if (!id) return;
    try {
      const res = await axiosInstance.get(`/appointments/${id}`);
      setAppointment(res.data.result);
    } catch (err) {
      console.error('❌ 약속 상세 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) getAppointment();
  }, [id]);

  if (loading || !appointment) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  const isHost = profile?.memberId === appointment.hostId;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: appointment.imageUrl }}
        style={styles.headerImage}
        resizeMode="cover"
      >
        <View style={styles.headerOverlay} />
        <View style={[styles.headerButtons, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Entypo name="share" size={24} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={24} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.contentBox, animatedStyle]}>
          <View style={styles.scrollContent}>
            <View style={styles.infoBox}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{appointment.name}</Text>
                {isHost && (
                  <View style={styles.hostButtons}>
                    <TouchableOpacity style={styles.iconButtonSmall} onPress={() => router.push(`/promises/${id}/edit`)}>
                      <MaterialIcons name="edit" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButtonSmall}>
                      <MaterialIcons name="published-with-changes" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButtonSmall}>
                      <Feather name="x" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={styles.detailRow}>
                <Feather name="calendar" size={18} color={Colors.primary} style={{ marginRight: 2 }} />
                <Text style={styles.detailText}>{dayjs(appointment.time).format('YYYY년 M월 D일 HH:mm')}</Text>
              </View>

              <View style={styles.detailRow}>
                <FontAwesome5 name="map-marker-alt" size={18} color={Colors.primary} style={{ marginRight: 2 }} />
                <Text style={styles.detailText}>
                  {appointment.placeName ? appointment.placeName : <Text style={{ fontStyle: 'italic', color: Colors.grayLightText, fontSize: 14 }}>선택한 장소가 없습니다.</Text>}
                  {appointment.memo ? appointment.memo : ''}
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
                      <View style={styles.profileImageBox}>
                        {item.profileImage ? (
                          <ImageBackground source={{ uri: item.profileImage }} style={styles.profileImage} />
                        ) : (
                          <View style={styles.profilePlaceholder}>
                            <Text>{item.name.charAt(0)}</Text>
                          </View>
                        )}
                      </View>
                    )}
                  />
                ) : (
                  <Text style={{ fontStyle: 'italic', color: Colors.grayLightText }}>선택한 참가자가 없습니다.</Text>
                )}
                {isHost && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.iconButtonSmall}>
                      <MaterialIcons name="attach-money" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButtonSmall}>
                      <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'map' && styles.activeTab]}
                onPress={() => setSelectedTab('map')}
              >
                <Text style={selectedTab === 'map' ? styles.activeTabText : styles.tabText}>지도</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, selectedTab === 'interest' && styles.activeTab]}
                onPress={() => setSelectedTab('interest')}
              >
                <Text style={selectedTab === 'interest' ? styles.activeTabText : styles.tabText}>관심사</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1 }}>
              {selectedTab === 'map' ? (
                <MapViewSection
                  appointmentId={appointment.appointmentId}
                  placeId={appointment.placeId}
                  placeName={appointment.placeName}
                  isHost={isHost}
                />
              ) : (
                <InterestViewSection />
              )}
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
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
    position: 'absolute',
    width: '100%',
    height: TOP_IMAGE_HEIGHT,
    top: 0,
    left: 0,
    right: 0,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(233,217,197,0.7)',
  },
  headerButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    position: 'absolute',
    width: '100%',
    zIndex: 10,
  },
  headerRightButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    padding: 4,
  },
  iconButtonSmall: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 7,
    padding: 4,
  },
  contentBox: {
    marginTop: TOP_IMAGE_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: {
    flex: 1,
  },
  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
    gap: 7,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.primary,
  },
  hostButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 17,
    color: Colors.primary,
    marginBottom: 4,
  },
  profileImageBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ddd',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 12,
    gap: 16,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.grayDarkText,
  },
  activeTabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 'auto',
  },
});