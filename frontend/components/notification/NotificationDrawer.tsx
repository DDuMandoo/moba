// components/NotificationDrawer.tsx
import { View, Text, TouchableOpacity, Pressable, FlatList, Image } from 'react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import axiosInstance from '@/app/axiosInstance';
import { router } from 'expo-router';

interface Notification {
  id: number;
  content: string;
  type: 'REMINDER' | 'INVITE' | 'WALLET';
  isRead: boolean;
  createdAt: string;
  deepLink: string;
}

const iconMap: Record<Notification['type'], any> = {
  REMINDER: require('@/assets/icons/header/ReminderAlertIcon.png'),
  INVITE: require('@/assets/icons/header/InviteAlertIcon.png'),
  WALLET: require('@/assets/icons/header/WalletAlertIcon.png'),
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
      await axiosInstance.patch(`/notifications/${item.id}/read`);
      onClose();
      router.push(item.deepLink as never);
    } catch (err) {
      console.error('🔴 알림 읽음 처리 실패:', err);
    }
  };

  if (!visible) return null;

  return (
    <Pressable className="absolute inset-0 z-50" onPress={onClose}>
      <Animated.View
        entering={SlideInRight.duration(300)}
        exiting={SlideOutRight.duration(300)}
        className="absolute right-0 top-0 h-full w-2/3 bg-white shadow-xl p-4"
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-lg font-bold">알림</Text>
          <TouchableOpacity onPress={onClose}>
            <Text className="text-xl">✕</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center gap-4 mb-4"
              onPress={() => handleNotificationPress(item)}
            >
              <Image source={iconMap[item.type]} className="w-10 h-10" resizeMode="contain" />
              <View className="flex-1">
                <Text className="text-sm font-medium">{item.content}</Text>
                <Text className="text-xs text-gray-500">{formatDate(item.createdAt)}</Text>
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
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default NotificationDrawer;
