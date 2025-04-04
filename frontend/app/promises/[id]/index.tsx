import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/redux/hooks';
import axiosInstance from '@/app/axiosInstance';
import Colors from '@/constants/Colors';
import PagerView, { PagerViewOnPageSelectedEventData } from 'react-native-pager-view';
import DotIndicator from '@/components/promises/DotIndicator';
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
  const pagerRef = useRef<PagerView>(null);
  const router = useRouter();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const translateY = useSharedValue(0);
  const HEADER_MARGIN = insets.top + 60;
  const minTranslateY = -TOP_IMAGE_HEIGHT + HEADER_MARGIN;
  const maxTranslateY = 0;

  const gestureHandler = useAnimatedGestureHandler({
    onActive: (event) => {
      translateY.value = Math.max(minTranslateY, Math.min(maxTranslateY, translateY.value + event.translationY));
    },
    onEnd: () => {
      translateY.value = withSpring(
        translateY.value < minTranslateY / 2 ? minTranslateY : maxTranslateY,
        { damping: 20 }
      );
    },
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

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

  const handleDotPress = (index: number) => {
    pagerRef.current?.setPage(index);
    setCurrentPage(index);
  };

  const handlePageSelected = (e: NativeSyntheticEvent<PagerViewOnPageSelectedEventData>) => {
    setCurrentPage(e.nativeEvent.position);
  };

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
            <Ionicons name="menu" size={26} color="white" />
          </TouchableOpacity>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="share" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.contentBox, animatedStyle]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.infoBox}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{appointment.name}</Text>
                {isHost && (
                  <View style={styles.hostButtons}>
                    <TouchableOpacity onPress={() => router.push(`/promises/${id}/edit`)}>
                      <Text style={styles.hostBtn}>수정</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={styles.hostBtn}>위임</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                      <Text style={[styles.hostBtn, styles.redText]}>종료</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
              <Text style={styles.time}>{dayjs(appointment.time).format('YYYY년 M월 D일 HH:mm')}</Text>
              <Text style={styles.location}>📍 {appointment.memo || '장소 정보 없음'}</Text>
            </View>

            <FlatList
              horizontal
              data={appointment.participants}
              keyExtractor={(item) => String(item.memberId)}
              contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
              renderItem={({ item }) => (
                <View style={{ alignItems: 'center' }}>
                  <View style={styles.profileImageBox}>
                    {item.profileImage ? (
                      <ImageBackground source={{ uri: item.profileImage }} style={styles.profileImage} />
                    ) : (
                      <View style={styles.profilePlaceholder}>
                        <Text>{item.name.charAt(0)}</Text>
                      </View>
                    )}
                  </View>
                  <Text>{item.name}</Text>
                </View>
              )}
            />

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, paddingHorizontal: 20 }}>
              <TouchableOpacity style={styles.smallBtn}><Text style={styles.smallBtnText}>정산하기</Text></TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn}><Text style={styles.smallBtnText}>채팅</Text></TouchableOpacity>
            </View>

            <View style={{ alignItems: 'center', marginVertical: 10 }}>
              <DotIndicator activeIndex={currentPage} onDotPress={handleDotPress} />
            </View>
          </ScrollView>

          <PagerView
            ref={pagerRef}
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={handlePageSelected}
          >
            <View key="map" style={styles.pagerPage}>
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <MapViewSection
                  latitude={appointment.latitude}
                  longitude={appointment.longitude}
                  places={[{ title: appointment.memo || '장소 없음', order: 1 }]}
                  isHost={isHost}
                />
              </ScrollView>
            </View>
            <View key="interest" style={styles.pagerPage}>
              <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
                <InterestViewSection />
              </ScrollView>
            </View>
          </PagerView>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerImage: { position: 'absolute', width: '100%', height: TOP_IMAGE_HEIGHT, top: 0, left: 0, right: 0 },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(233,217,197,0.7)' },
  headerButtons: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, position: 'absolute', width: '100%', zIndex: 10 },
  headerRightButtons: { flexDirection: 'row', gap: 10 },
  iconButton: { borderWidth: 1, borderColor: Colors.black, borderRadius: 10, padding: 6 },
  contentBox: {
    flex: 1,
    marginTop: TOP_IMAGE_HEIGHT,
    backgroundColor: Colors.white,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  scrollContent: { paddingBottom: 40 },
  infoBox: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  hostButtons: { flexDirection: 'row', gap: 10 },
  hostBtn: { fontSize: 14, color: Colors.grayDarkText },
  redText: { color: 'red' },
  time: { marginTop: 4, color: Colors.grayDarkText },
  location: { marginTop: 6, color: Colors.text },
  profileImageBox: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', backgroundColor: '#ddd' },
  profileImage: { width: '100%', height: '100%' },
  profilePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  smallBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderColor: Colors.grayDarkText, borderWidth: 1 },
  smallBtnText: { fontSize: 13, color: Colors.text },
  pagerView: { flex: 1, height: SCREEN_HEIGHT * 0.6 },
  pagerPage: { flex: 1 },
});
