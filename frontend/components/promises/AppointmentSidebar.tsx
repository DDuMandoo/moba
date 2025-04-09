import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axiosInstance from '@/app/axiosInstance';

const { width } = Dimensions.get('window');
const SIDEBAR_WIDTH = width * 0.7;

export default function AppointmentSidebar({
  visible,
  onClose,
  appointmentId,
}: {
  visible: boolean;
  onClose: () => void;
  appointmentId: number;
}) {
  const router = useRouter();
  const [images, setImages] = useState<any[]>([]);
  const sidebarAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();

      axiosInstance
        .get(`/appointments/${appointmentId}/images`, { params: { size: 3 } })
        .then((res) => setImages(res.data.result.images || []))
        .catch((err) => console.error('이미지 로딩 실패', err));
    } else {
      Animated.timing(sidebarAnim, {
        toValue: -SIDEBAR_WIDTH,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(sidebarAnim, {
      toValue: -SIDEBAR_WIDTH,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      onClose(); // 애니메이션 끝나고 닫기
    });
  };

  return visible ? (
    <TouchableWithoutFeedback onPress={handleClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.sidebar, { left: sidebarAnim }]}>
            <View style={styles.header}>
            <Ionicons name="close" size={28} color={Colors.text} onPress={handleClose} />
            </View>

            {/* ✅ 갤러리 섹션 */}
            <TouchableOpacity onPress={() => router.push(`/promises/${appointmentId}/gallery`)}>
                <View style={styles.galleryHeader}>
                    <Text style={styles.sectionTitle}>갤러리</Text>
                    <Ionicons name="chevron-forward" size={20} color={Colors.text} />
                </View>
                <View style={styles.gallerySection}>
                {images.length > 0 ? (
                    <FlatList
                        horizontal
                        data={images}
                        keyExtractor={(item) => String(item.imageId)}
                        renderItem={({ item }) => (
                        <Image source={{ uri: item.imageUrl }} style={styles.galleryImage} />
                        )}
                        contentContainerStyle={styles.galleryListContent}
                        showsHorizontalScrollIndicator={false}
                    />
                ) : (
                    <Text style={styles.noImageText}>
                    약속 사진이 없어요.
                    </Text>
                )}
                </View>
            </TouchableOpacity>

            {/* 놀거리 */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>놀거리</Text>
            <View style={styles.iconGrid}>
            <View style={styles.iconRowCenter}>
              <GameIcon
                label="룰렛"
                source={require('@/assets/images/game/rouletteGame.png')}
                onPress={() => router.push(`/games/roulette`)}
              />
              <GameIcon
                label="핀볼"
                source={require('@/assets/images/game/pinballGame.png')}
                onPress={() => router.push(`/games/pinball`)}
              />
            </View>
            <View style={styles.iconRowCenter}>
              <GameIcon
                label="복불복"
                source={require('@/assets/images/game/randomGame.png')}
                onPress={() => router.push(`/games/random`)}
              />
              <GameIcon
                label="주사위 굴리기"
                source={require('@/assets/images/game/diceGame.png')}
                onPress={() => router.push(`/games/dice`)}
              />
            </View>
            <View style={styles.iconRowCenter}>
              <GameIcon
                label="사다리 타기"
                source={require('@/assets/images/game/ladderGame.png')}
                onPress={() => router.push(`/promises/${appointmentId}/games/ladder`)}
              />
            </View>

            </View>
        </Animated.View>
        </View>
    </TouchableWithoutFeedback>
  ) : null;
}

function GameIcon({
  label,
  source,
  size = 48,
  onPress,
}: {
  label: string;
  source: any;
  size?: number;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={[styles.iconButton, { width: size * 2 }]} onPress={onPress}>
      <Image
        source={source}
        style={[styles.gameImage, { width: size, height: size }]}
        resizeMode="contain"
      />
      <Text style={styles.iconLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000040',
    flexDirection: 'row',
    zIndex: 20,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: Colors.background,
    paddingTop: 60,
    zIndex: 40,
  },
  header: {
    position: 'absolute',
    top: 20,
    right: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    color: Colors.text,
    paddingLeft: 15
  },
  gallerySection: {
    backgroundColor: '#EDE4D9',
    paddingVertical: 12,
    marginBottom: 16,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingRight: '5%',
  },
  galleryListContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    flexGrow: 1,
    gap: 3,
  },  
  galleryImage: {
    width: 85,
    height: 85,
    borderRadius: 8,
    marginRight: 8,
  },
  noImageText: {
    fontSize: 16,
    color: Colors.grayDarkText,
    fontStyle: 'italic',
    marginLeft: 10,
  },
  iconGrid: {
    gap: 16,
    marginTop: 10
  },
  iconRowCenter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 35,
    marginBottom: 16,
  },
  iconButton: {
    alignItems: 'center',
    
    gap: 6,
  },
  gameImage: {
    width: 48,
    height: 48,
    marginBottom: 6,
  },
  iconLabel: {
    fontSize: 14,
    color: Colors.black,
  },
});