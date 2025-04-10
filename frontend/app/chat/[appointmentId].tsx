import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Keyboard,
  Image,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Platform,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import axiosInstance from '@/app/axiosInstance';
import { useAppSelector } from '@/redux/hooks';
import dayjs from 'dayjs';

interface ChatMessage {
  senderId: number;
  message: string;
  sentAt: string;
  appointmentId: number;
}

interface ParticipantInfo {
  name: string;
  profileImage?: string;
}

type ChatItem = { type: 'message'; data: ChatMessage } | { type: 'date'; dateLabel: string };

const PAGE_SIZE = 40;

export default function ChatPage() {
  const { appointmentId } = useLocalSearchParams<{ appointmentId: string }>();
  const numericAppointmentId = Number(appointmentId);
  const { profile } = useAppSelector((state) => state.user);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<Record<number, ParticipantInfo>>({});
  const [input, setInput] = useState('');
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);
  const [newIncomingMessage, setNewIncomingMessage] = useState<ChatMessage | null>(null);
  const [appointmentTitle, setAppointmentTitle] = useState('');


  const stompClient = useRef<Client | null>(null);
  const flatListRef = useRef<FlatList<ChatItem>>(null);
  const isAtBottomRef = useRef(true);
  const preserveScroll = useRef(false);
  const prevContentHeight = useRef(0);

  const formatDateLabel = (dateStr: string) => {
    const date = dayjs(dateStr).startOf('day');
    const today = dayjs().startOf('day');
    const yesterday = today.subtract(1, 'day');
    if (date.isSame(today)) return '오늘';
    if (date.isSame(yesterday)) return '어제';
    return date.format('YYYY년 M월 D일');
  };

  const buildMessagesWithDateSeparators = (msgs: ChatMessage[]): ChatItem[] => {
    const result: ChatItem[] = [];
    let lastDate = '';
    msgs.forEach((msg) => {
      const currentDate = dayjs(msg.sentAt).format('YYYY-MM-DD');
      if (currentDate !== lastDate) {
        result.push({ type: 'date', dateLabel: formatDateLabel(msg.sentAt) });
        lastDate = currentDate;
      }
      result.push({ type: 'message', data: msg });
    });
    return result;
  };

  const fetchAppointmentInfo = async () => {
    try {
      const res = await axiosInstance.get(`/appointments/${numericAppointmentId}`);
      setAppointmentTitle(res.data.result.name);
    } catch (err) {
      console.error('❌ 약속 정보 로딩 실패:', err);
    }
  };
  

  const messagesWithDateSeparators = buildMessagesWithDateSeparators(messages);

  const loadMessages = async (pageToLoad = 0) => {
    try {
      const res = await axiosInstance.get(`/chat/${numericAppointmentId}?page=${pageToLoad}&size=${PAGE_SIZE}`);
      if (Array.isArray(res.data)) {
        if (res.data.length < PAGE_SIZE) setHasMore(false);
        setMessages((prev) => {
          if (pageToLoad === 0) return res.data;
          return [...res.data, ...prev];
        });
      }
    } catch (err) {
      console.error('❌ 메시지 로딩 실패:', err);
    }
  };

  const fetchParticipants = async () => {
    try {
      const res = await axiosInstance.get(`/appointments/${numericAppointmentId}/participants`);
      const map: Record<number, ParticipantInfo> = {};
      res.data.result.participants.forEach((p: any) => {
        map[p.memberId] = {
          name: p.name,
          profileImage: p.profileImage,
        };
      });
      setParticipants(map);
    } catch (err) {
      console.error('❌ 참가자 정보 로딩 실패:', err);
    }
  };

  const connectStomp = () => {
    const client = new Client({
      webSocketFactory: () => new SockJS('https://j12a601.p.ssafy.io/api/ws/chat'),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => console.log('📡 STOMP:', str),
      onConnect: () => {
        client.subscribe(`/topic/chat.${appointmentId}`, (message) => {
          const received = JSON.parse(message.body);
          const chat: ChatMessage = received;
          const isMine = chat.senderId === profile?.memberId;
          setMessages((prev) => [...prev, chat]);
          if (isMine || isAtBottomRef.current) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            setShowNewMessageBanner(false);
          } else {
            setNewIncomingMessage(chat);
            setShowNewMessageBanner(true);
          }
        });
      },
    });
    client.activate();
    stompClient.current = client;
  };

  const currentScrollOffset = useRef(0);
  const scrollOffsetBeforePrepend = useRef<number | null>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    currentScrollOffset.current = contentOffset.y;
    
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    const isBottom = Math.abs(distanceFromBottom) < 50;
    isAtBottomRef.current = isBottom;

    if (contentOffset.y <= 1 && hasMore && !loadingMore) {
      scrollOffsetBeforePrepend.current = contentOffset.y;
      prevContentHeight.current = contentSize.height;
      preserveScroll.current = true;
      setLoadingMore(true);
      const nextPage = page + 1;
      loadMessages(nextPage).then(() => setPage(nextPage)).finally(() => setLoadingMore(false));
    }

  };

  const sendMessage = () => {
    if (!input || !stompClient.current?.connected || !profile) return;
    const payload = {
      appointmentId: numericAppointmentId,
      senderId: profile.memberId,
      senderName: profile.name,
      message: input,
    };
    stompClient.current.publish({
      destination: '/app/api/chat.send',
      body: JSON.stringify(payload),
    });
    setInput('');
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    (async () => {
      await fetchAppointmentInfo();
      await fetchParticipants();
      await loadMessages(0);
      connectStomp();
    })();
    return () => {
      stompClient.current?.deactivate();
    };
  }, []);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'android' ? undefined : 'padding'}>
      {/* 상단 제목 */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {appointmentTitle || `채팅방 ${appointmentId}`}
        </Text>
        <Text style={styles.participantCount}>
          {Object.keys(participants).length}명 참여
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messagesWithDateSeparators}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          if (item.type === 'date') {
            return (
              <View style={styles.dateSeparator}>
                <Text style={styles.dateText}>{item.dateLabel}</Text>
              </View>
            );
          }
          const isMine = profile?.memberId === item.data.senderId;
          const senderInfo = participants[item.data.senderId];
          return (
            <View style={[styles.messageWrapper, isMine ? styles.myWrapper : styles.otherWrapper]}>
              {!isMine && (
                <View style={styles.avatarRow}>
                  {senderInfo?.profileImage ? (
                    <Image source={{ uri: senderInfo.profileImage }} style={styles.profileImage} />
                  ) : (
                    <View style={styles.profilePlaceholder}>
                      <Text style={styles.placeholderText}>{senderInfo?.name?.charAt(0) ?? '?'}</Text>
                    </View>
                  )}
                  <Text style={styles.senderName}>{senderInfo?.name ?? '익명'}</Text>
                </View>
              )}

              <View style={styles.bubbleRow}>
                {isMine && (
                  <Text style={styles.timestampSide}>
                    {dayjs(item.data.sentAt).add(9,'hour').format('A hh:mm')}
                  </Text>
                )}
                <View style={[styles.bubble, isMine ? styles.myBubble : styles.otherBubble]}>
                  <Text style={styles.messageText}>{item.data.message}</Text>
                </View>
                {!isMine && (
                  <Text style={styles.timestampSide}>
                    {dayjs(item.data.sentAt).add(9,'hour').format('A hh:mm')}
                  </Text>
                )}
              </View>
            </View>
          );
        }}
        onScroll={handleScroll}
        scrollEventThrottle={100}
        onContentSizeChange={(w, h) => {
          if (preserveScroll.current && prevContentHeight.current !== 0) {
            const diff = h - prevContentHeight.current;
        
            flatListRef.current?.scrollToOffset({
              offset: currentScrollOffset.current + diff,
              animated: false,
            });
        
            preserveScroll.current = false;
          }
        
          // 새 메시지로 인한 스크롤 하단 이동
          if (page === 0 && !preserveScroll.current && isAtBottomRef.current) {
            setTimeout(() => {
              flatListRef.current?.scrollToEnd({ animated: false });
            }, 100); // 약간의 delay가 안전
          }
        
          prevContentHeight.current = h;
        }}
        
      />

      {/* 새 메시지 배너 */}
      {showNewMessageBanner && newIncomingMessage && (
        <TouchableOpacity
          style={styles.newMessageBanner}
          onPress={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
            isAtBottomRef.current = true;
            setShowNewMessageBanner(false);
            setNewIncomingMessage(null);
          }}
        >
          <Text style={styles.newMessageText}>
            {participants[newIncomingMessage.senderId]?.name ?? '익명'}: {newIncomingMessage.message}
          </Text>
        </TouchableOpacity>
      )}

      {/* 입력창 */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="메시지를 입력하세요"
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 52,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,                  // 남은 공간을 최대한 차지
    overflow: 'hidden',
  },
  
  messageWrapper: { marginVertical: 6, maxWidth: '80%', marginHorizontal: 12, marginBottom: 12, },
  myWrapper: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  otherWrapper: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  avatarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  profileImage: { width: 24, height: 24, borderRadius: 12, marginRight: 6 },
  profilePlaceholder: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center', marginRight: 6,
  },
  placeholderText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  senderName: { fontSize: 17, fontWeight: '600', color: '#555', marginTop: -2 },
  bubble: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '80%', },
  myBubble: { backgroundColor: '#b28876' },
  otherBubble: { backgroundColor: '#fff' },
  messageText: { fontSize: 15, color: '#000', flexShrink: 1, },
  timestamp: { fontSize: 10, color: '#666', backgroundColor: 'transparent', marginTop: 4 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: '#b28876',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  newMessageBanner: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#333',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  newMessageText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  dateSeparator: {
    alignSelf: 'center',
    backgroundColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  dateText: { fontSize: 13, color: '#555' },  
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexWrap: 'nowrap',
    maxWidth: '92%',
  },
  timestampSide: {
    fontSize: 10,
    color: '#666',
    backgroundColor: 'transparent',
    marginHorizontal: 6,
  },
  headerRow: {
    height: 52,
    backgroundColor: '#f8f8f8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },
  participantCount: {
    fontSize: 13,
    color: '#777',
  },  
});
