import { useLocalSearchParams } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  ActivityIndicator,
  FlatList,
  NativeSyntheticEvent,
  StyleSheet
} from 'react-native';
import { useEffect, useState } from 'react';
import axiosInstance from '@/app/axiosInstance';
import { Ionicons, Feather } from '@expo/vector-icons';
import dayjs from 'dayjs';
import PagerView, { PagerViewOnPageSelectedEventData } from 'react-native-pager-view';
import MapViewSection from '@/components/promises/MapViewSection';
import InterestViewSection from '@/components/promises/InterestViewSection';
import DotIndicator from '@/components/promises/DotIndicator';
import Colors from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '@/redux/hooks';

export default function AppointmentDetailPage() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { profile } = useAppSelector((state) => state.user);
  const [appointment, setAppointment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const insets = useSafeAreaInsets();

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
    if (id) {
      getAppointment();
    }
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
        resizeMode="cover"
        style={styles.headerImage}
        imageStyle={styles.headerImageOverlay}
      >
        <View style={[styles.headerButtons, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => console.log('☰ 햄버거 메뉴')} style={styles.iconButton}>
            <Ionicons name="menu" size={26} color="white" />
          </TouchableOpacity>
          <View style={styles.headerRightButtons}>
            <TouchableOpacity onPress={() => console.log('🔗 공유')} style={styles.iconButton}>
              <Feather name="share" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log('🚪 약속 나가기')} style={styles.iconButton}>
              <Ionicons name="log-out-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.innerPadding}>
            <View style={styles.infoSection}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{appointment.name}</Text>
                {isHost && (
                  <View style={styles.hostButtons}>
                    <TouchableOpacity onPress={() => console.log('✏️ 약속 수정')}><Text style={styles.hostBtn}>수정</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('👑 방장 위임')}><Text style={styles.hostBtn}>방장 위임</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => console.log('🛑 약속 종료')}><Text style={[styles.hostBtn, styles.redText]}>종료</Text></TouchableOpacity>
                  </View>
                )}
              </View>
              <Text style={styles.dateText}>{dayjs(appointment.time).format('YYYY년 M월 D일 HH:mm')}</Text>
              <Text style={styles.locationText}>📍 {appointment.memo || '장소 정보 없음'}</Text>
            </View>

            <View style={styles.participantsSection}>
              <Text style={styles.participantsTitle}>참가자</Text>
              <FlatList
                horizontal
                data={appointment.participants}
                keyExtractor={(item) => String(item.memberId)}
                contentContainerStyle={styles.participantList}
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.participantItem}>
                    <View style={styles.profileImageBox}>
                      {item.profileImage ? (
                        <ImageBackground source={{ uri: item.profileImage }} style={styles.profileImage} />
                      ) : (
                        <View style={styles.profilePlaceholder}><Text style={styles.profileInitial}>{item.name.charAt(0)}</Text></View>
                      )}
                    </View>
                    <Text style={styles.participantName}>{item.name}</Text>
                  </View>
                )}
              />
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => console.log('💰 정산하기')} style={styles.smallBtn}><Text style={styles.smallBtnText}>정산하기</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => console.log('💬 채팅')} style={styles.smallBtn}><Text style={styles.smallBtnText}>채팅</Text></TouchableOpacity>
              </View>
            </View>
          </View>

          <DotIndicator activeIndex={currentPage} />

          <PagerView
            style={styles.pagerView}
            initialPage={0}
            onPageSelected={(e: NativeSyntheticEvent<PagerViewOnPageSelectedEventData>) => setCurrentPage(e.nativeEvent.position)}
          >
            <View key="map">
              <MapViewSection
                latitude={appointment.latitude}
                longitude={appointment.longitude}
                places={[{ title: appointment.memo || '장소 없음', order: 1 }]}
                isHost={isHost}
              />
            </View>
            <View key="interest">
              <InterestViewSection />
            </View>
          </PagerView>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.white },
  headerImage: { width: '100%', height: 240 },
  headerImageOverlay: { opacity: 0.7, backgroundColor: Colors.yellowAccent },
  headerButtons: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20 },
  iconButton: { borderWidth: 1, borderColor: Colors.black, borderRadius: 10, padding: 8 },
  headerRightButtons: { flexDirection: 'row', gap: 10 },
  contentContainer: { flex: 1, marginTop: -40, backgroundColor: Colors.white, borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: 'hidden' },
  scrollContent: { paddingBottom: 40 },
  innerPadding: { paddingHorizontal: 20, paddingTop: 24 },
  infoSection: { marginBottom: 24 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  hostButtons: { flexDirection: 'row', gap: 8 },
  hostBtn: { fontSize: 14, color: Colors.grayDarkText },
  redText: { color: 'red' },
  dateText: { color: Colors.grayDarkText, marginTop: 4 },
  locationText: { color: Colors.text, marginTop: 6 },
  participantsSection: { marginBottom: 20 },
  participantsTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  participantList: { gap: 10 },
  participantItem: { alignItems: 'center' },
  profileImageBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ddd', overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  profilePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  profileInitial: { color: Colors.grayDarkText },
  participantName: { fontSize: 12, marginTop: 4 },
  actionButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  smallBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, borderColor: Colors.grayDarkText, borderWidth: 1 },
  smallBtnText: { fontSize: 13, color: Colors.text },
  pagerView: { height: 520 }
});
