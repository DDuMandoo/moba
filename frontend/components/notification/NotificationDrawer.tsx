// components/NotificationDrawer.tsx
import { View, Text, TouchableOpacity, Pressable, FlatList, Image, StyleSheet } from 'react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import axiosInstance from '@/app/axiosInstance';
import { router } from 'expo-router';
import Colors from '@/constants/Colors';
import { Feather } from '@expo/vector-icons';
import { getAccessToken } from '@/app/axiosInstance';


interface Notification {
  id: number;
  content: string;
  type: 'REMINDER' | 'INVITE' | 'PAY';
  isRead: boolean;
  createdAt: string;
  deepLink: string;
}

const iconMap: Record<Notification['type'], any> = {
  REMINDER: require('@/assets/icons/header/ReminderAlertIcon.png'),
  INVITE: require('@/assets/icons/header/InviteAlertIcon.png'),
  PAY: require('@/assets/icons/header/WalletAlertIcon.png'),
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

const NotificationDrawer = ({ visible, onClose }: Props) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (visible) fetchNotifications();
  }, [visible]);

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications/unread');
      setNotifications(res.data.result);
    } catch (err) {
      console.error('🔴 알림 불러오기 실패:', err);
    }
  };

  const handleNotificationPress = async (item: Notification) => {
    try {
      onClose();
  
      const accessToken = await getAccessToken();
  
      if (accessToken) {
        router.push(item.deepLink as any);
      } else {
        // 로그인으로 이동하고, redirect param 전달
        router.replace({
          pathname: '/auth/login',
          params: { redirect: item.deepLink },
        });
      }
    } catch (err) {
      console.error('🔴 알림 이동 실패:', err);
    }
  };

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Animated.View
        entering={SlideInRight.duration(300)}
        exiting={SlideOutRight.duration(300)}
        style={styles.drawer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>알림</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleNotificationPress(item)}
            >
              <View style={styles.iconWrapper}>
                <Image
                  source={iconMap[item.type]}
                  style={styles.icon}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.textWrapper}>
                <Text style={styles.contentText}>{item.content}</Text>
                <View style={styles.dateRow}>
                  <Feather name="calendar" size={12} color={Colors.grayDarkText} style={styles.calendarIcon} />
                  <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
    </Pressable>
  );
};

const formatDate = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: '70%',
    backgroundColor: Colors.background,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: -2, height: 0 },
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeIcon: {
    fontSize: 24,
    color: '#4B5563',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    justifyContent: 'flex-start',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    width: 36,
    height: 36,
  },
  textWrapper: {
    flex: 1,
  },
  contentText: {
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 4,
    color: Colors.black,
    lineHeight: 17,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calendarIcon: {
    marginRight: 6,
  },  
  dateText: {
    fontSize: 12,
    color: Colors.grayDarkText,
    marginBottom: 3,
  },
});

export default NotificationDrawer;
