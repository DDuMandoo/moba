import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';

const { width } = Dimensions.get('window');

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsOverlay({ visible, onClose }: Props) {
  const router = useRouter();

  const [notificationOn, setNotificationOn] = useState(true);
  const [locationOn, setLocationOn] = useState(true);

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true
        })
      ]).start();
    } else {
      opacity.setValue(0);
      translateY.setValue(-30);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={styles.backdrop}
      activeOpacity={1}
      onPress={onClose}
    >
      <Animated.View
        style={[
          styles.menuBox,
          {
            opacity,
            transform: [{ translateY }]
          }
        ]}
      >
        <TouchableOpacity
          style={styles.item}
          onPress={() => setNotificationOn(!notificationOn)}
        >
          <Feather
            name={notificationOn ? 'bell' : 'bell-off'}
            size={20}
            color={Colors.grayDarkText}
          />
          <Text style={styles.text}>알림 설정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => setLocationOn(!locationOn)}
        >
          <Feather
            name={locationOn ? 'map-pin' : 'map'}
            size={20}
            color={Colors.grayDarkText}
          />
          <Text style={styles.text}>위치 설정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            onClose();
            router.push('/profile-edit');
          }}
        >
          <Feather name="edit" size={20} color={Colors.grayDarkText} />
          <Text style={styles.text}>프로필 수정</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.item}
          onPress={() => {
            onClose();
            // SecureStore 삭제 로직 등
            router.replace('/');
          }}
        >
          <Feather name="log-out" size={20} color={Colors.grayDarkText} />
          <Text style={styles.text}>로그아웃</Text>
        </TouchableOpacity>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height: '100%',
    zIndex: 100
  },
  menuBox: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  text: {
    fontSize: 16,
    color: Colors.black
  }
});
