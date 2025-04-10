import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Easing,
  Pressable
} from 'react-native';
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { toggleNotification, toggleLocation } from '@/redux/slices/permissionSlice';
import { RootState } from '@/redux/store';
import { savePermissions } from '@/utils/permissions';
import Colors from '@/constants/Colors';
import axiosInstance, { clearTokens } from '@/app/axiosInstance';
import { router } from 'expo-router';
import CustomAlert from '../CustomAlert';

const SCREEN_WIDTH = Dimensions.get('window').width;
const OVERLAY_WIDTH = 150;
const RIGHT_PADDING = SCREEN_WIDTH * 0.05;
const TARGET_LEFT = SCREEN_WIDTH - OVERLAY_WIDTH - RIGHT_PADDING;

interface Props {
  visible: boolean;
  onClose: () => void;
  onEditProfile: () => void;
}

export default function SettingOverlay({ visible, onClose, onEditProfile }: Props) {
  const dispatch = useDispatch();
  const { notification, location, gallery } = useSelector((state: RootState) => state.permissions);
  const [logoutAlert, setLogoutAlert] = useState(false);

  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: TARGET_LEFT,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 300,
        easing: Easing.in(Easing.ease),
        useNativeDriver: false
      }).start();
    }
  }, [visible]);

  const handleToggleNotification = () => {
    dispatch(toggleNotification());
    savePermissions({ notification: !notification, location, gallery });
  };

  const handleToggleLocation = () => {
    dispatch(toggleLocation());
    savePermissions({ notification, location: !location, gallery});
  };

  const handleEditProfile = () => {
    onClose(); 
    onEditProfile();
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/signout');
    } catch (err) {
      console.warn('🚫 로그아웃 실패:', err);
    } finally {
      router.replace('/auth/login');
    }
  };

  if (!visible) return null;

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Animated.View style={[styles.overlay, { left: slideAnim }]}>
        {/* 알림 설정 */}
        <TouchableOpacity style={styles.row} onPress={handleToggleNotification}>
          {notification ? (
            <Ionicons name="notifications" size={20} color={Colors.secondary} />
          ) : (
            <Ionicons name="notifications-off" size={20} color={Colors.secondary} />
          )}
          <Text style={styles.label}>알림 설정</Text>
        </TouchableOpacity>

        {/* 위치 설정 */}
        <TouchableOpacity style={styles.row} onPress={handleToggleLocation}>
          {location ? (
            <Ionicons name="location" size={20} color={Colors.secondary} />
          ) : (
            <MaterialIcons name="location-off" size={20} color={Colors.secondary} />
          )}
          <Text style={styles.label}>위치 설정</Text>
        </TouchableOpacity>

        {/* 프로필 수정 */}
        <TouchableOpacity style={styles.row} onPress={handleEditProfile}>
          <MaterialCommunityIcons name="pencil-outline" size={20} color={Colors.secondary} />
          <Text style={styles.label}>프로필 수정</Text>
        </TouchableOpacity>

        {/* 로그아웃 */}
        <TouchableOpacity style={styles.row} onPress={() => setLogoutAlert(true)}>
          <Ionicons name="log-out-outline" size={20} color={Colors.secondary} />
          <Text style={styles.label}>로그 아웃</Text>
        </TouchableOpacity>

        {/* 커스텀 Alert */}
        <CustomAlert
          visible={logoutAlert}
          title="로그아웃"
          message="정말 로그아웃 하시겠습니까?"
          onClose={() => {
            setLogoutAlert(false);
            handleLogout();
          }}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 999
  },
  overlay: {
    position: 'absolute',
    top: 60,
    width: OVERLAY_WIDTH,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 18,
    elevation: 6,
    gap: 16
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: Colors.black,
    marginLeft: 10
  }
});
