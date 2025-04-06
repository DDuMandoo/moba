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
  ScrollView,
  Animated,
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
import { ParticipantProfile } from '@/components/profile/ParticipantProfile';
import DelegateModal from '@/components/promises/DelegateModal';

const TOP_IMAGE_HEIGHT = 280;
const { width } = Dimensions.get('window');

export default function AppointmentDetailPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAppSelector((state) => state.user);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'map' | 'interest'>('map');
  // toastData: { name, x, y, width, height } 저장해서 토스트 위치 결정
  const [toastData, setToastData] = useState<{ name: string; x: number; y: number; width: number; height: number } | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const [toastWidth, setToastWidth] = useState(0);
  const [delegateModalVisible, setDelegateModalVisible] = useState(false);

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

  const handleParticipantPress = (name: string, x: number, y: number, boxWidth: number, boxHeight: number) => {
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

  const isHost = profile?.memberId === appointment.hostId;

  return (
    <View style={styles.container}>
      {/* 상단 약속 사진 */}
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

      {/* 하얀 박스 */}
      <View style={styles.whiteBox}>
        <View style={styles.fixedHeader}>
          <View style={styles.infoBox}>
            <View style={styles.titleRow}>
              <Text style={styles.title}>{appointment.name}</Text>
              {isHost && (
                <View style={styles.hostButtons}>
                  <TouchableOpacity
                    style={styles.iconButtonSmall}
                    onPress={() => router.push(`/promises/${id}/edit`)}
                  >
                    <MaterialIcons name="edit" size={18} color={Colors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDelegateModalVisible(true)} style={styles.iconButtonSmall}>
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
              <Text style={styles.detailText}>
                {dayjs(appointment.time).format('YYYY년 M월 D일 HH:mm')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <FontAwesome5 name="map-marker-alt" size={18} color={Colors.primary} style={{ marginRight: 2 }} />
              <Text style={styles.detailText}>
                {appointment.placeName ? appointment.placeName : (
                  <Text style={{ fontStyle: 'italic', color: Colors.grayLightText, fontSize: 14 }}>
                    선택한 장소가 없습니다.
                  </Text>
                )}
                {appointment.memo ? ` - ${appointment.memo}` : ''}
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
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.iconButtonSmall}>
                  <MaterialIcons name="attach-money" size={18} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButtonSmall}>
                  <Ionicons name="chatbubble-outline" size={18} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'map' && styles.activeTab]}
              onPress={() => setSelectedTab('map')}
            >
              <Text style={selectedTab === 'map' ? styles.activeTabText : styles.tabText}>
                지도
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, selectedTab === 'interest' && styles.activeTab]}
              onPress={() => setSelectedTab('interest')}
            >
              <Text style={selectedTab === 'interest' ? styles.activeTabText : styles.tabText}>
                관심사
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
          {selectedTab === 'map' ? (
            <MapViewSection
              appointmentId={appointment.appointmentId}
              placeId={appointment.placeId}
              placeName={appointment.placeName}
              isHost={isHost}
              appointmentTime={appointment.time}
            />
          ) : (
            <InterestViewSection />
          )}
        </ScrollView>
      </View>

      {/* 토스트 오버레이: 클릭한 참가자 프로필 위에 위치 (위치 조정 및 자동 너비 적용) */}
      {toastData && (
        <Animated.View
          onLayout={(e) => setToastWidth(e.nativeEvent.layout.width)}
          style={[
            styles.toastContainer,
            {
              left: toastData.x + toastData.width / 2,
              top: toastData.y - 35, // 이전보다 5px 아래
              opacity: toastOpacity,
              transform: [{ translateX: -toastWidth / 2 }],
            },
          ]}
        >
          <Text style={styles.toastText}>{toastData.name}</Text>
        </Animated.View>
      )}

      <DelegateModal
        visible={delegateModalVisible}
        onClose={() => setDelegateModalVisible(false)}
        appointmentId={appointment.appointmentId}
        currentHostId={appointment.hostId}
        participants={appointment.participants}
        onSuccess={(newHost) => {
          // 필요 시 상태 업데이트 등 추가 처리
          console.log('방장 위임 성공:', newHost);
        }}
      />
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
  fixedHeader: {
    paddingBottom: 10,
    backgroundColor: Colors.white,
  },
  infoBox: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.white,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 4,
  },
  hostButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 16,
    color: Colors.primary,
    marginBottom: 1,
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
  waitingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128,128,128,0.5)',
  },
  hourglassIconContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    padding: 1,
  },
  waitingPlaceholder: {
    backgroundColor: 'rgba(128,128,128,0.5)',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 'auto',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 2,
    gap: 16,
    borderColor: Colors.grayLightText,
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
  scrollableContent: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  toastContainer: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: Colors.logoInner,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 5,
    elevation: 3,
    marginTop: 3
  },
  toastText: {
    fontSize: 10,
    color: Colors.primary,
  },
});
