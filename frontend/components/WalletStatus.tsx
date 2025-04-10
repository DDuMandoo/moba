import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import Fonts from '@/constants/Fonts';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { fetchWalletBalance } from '@/redux/slices/walletSlice';

export default function WalletStatus() {
  const dispatch = useAppDispatch();
  const { balance, isLoading } = useAppSelector((state) => state.wallet);
  const [infoVisible, setInfoVisible] = useState(false);
  const 정산내역Ref = useRef<View>(null);
  const [buttonWidth, setButtonWidth] = useState<number | null>(null);

  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const containerWidth = Math.min(screenWidth * 0.9, 635);

  useEffect(() => {
    dispatch(fetchWalletBalance());
  }, [dispatch]);

  useEffect(() => {
    if (정산내역Ref.current) {
      정산내역Ref.current.measure((x, y, width) => {
        setButtonWidth(width);
      });
    }
  }, []);

  // 💳 잔액 변경 시 콘솔 확인
  useEffect(() => {
    console.log('💰 [WalletStatus] 잔액 상태 변경됨:', balance);
  }, [balance]);

  const formattedBalance = balance.toLocaleString('ko-KR');

  return (
    <View
      style={{
        width: containerWidth,
        backgroundColor: Colors.white,
        borderRadius: 16,
        padding: 20,
        gap: 16,
      }}
    >
      {/* 상단: 지갑 텍스트 + 금액 */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 16, fontFamily: Fonts.bold, color: Colors.text }}>
            내 지갑
          </Text>
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={Colors.grayDarkText}
            style={{ marginLeft: 4 }}
            onPress={() => setInfoVisible(true)}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 24,
                fontFamily: Fonts.extraBold,
                color: Colors.text,
              }}
            >
              {formattedBalance} 원
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={Colors.grayDarkText}
              style={{ marginLeft: 4 }}
              onPress={() => router.push('/wallet/detail')}
            />
          </View>
        )}
      </View>

      {/* 버튼 그룹 */}
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity
          ref={정산내역Ref}
          activeOpacity={0.8}
          onPress={() => router.push('/wallet/settlement/history')}
          style={{
            borderWidth: 1,
            borderColor: Colors.primary,
            borderRadius: 7,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.white,
            marginRight: 8,
          }}
        >
          <Ionicons name="cash-outline" size={16} color={Colors.primary} />
          <Text
            style={{
              color: Colors.primary,
              fontSize: 16,
              fontFamily: Fonts.bold,
              marginLeft: 4,
            }}
          >
            정산 내역
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push('/wallet/charge')}
          style={{
            width: buttonWidth ?? undefined,
            borderWidth: 1,
            borderColor: Colors.primary,
            borderRadius: 7,
            paddingHorizontal: 12,
            paddingVertical: 6,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: Colors.primary,
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: 16,
              fontFamily: Fonts.bold,
              marginLeft: 4,
            }}
          >
            +    충전
          </Text>
        </TouchableOpacity>
      </View>

      {/* 지갑 설명 모달 */}
      <Modal
        transparent
        visible={infoVisible}
        animationType="fade"
        onRequestClose={() => setInfoVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>지갑이란?</Text>
            <Text style={styles.modalDescription}>
              충전된 금액이 표시되는 공간이에요.{'\n'}
              다양한 기능에서 사용되고, 정산 내역과 송금 기록도 여기서 확인할 수 있어요.
            </Text>
            <Pressable style={styles.closeButton} onPress={() => setInfoVisible(false)}>
              <Text style={styles.closeText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: '5%',
    borderRadius: 12,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    color: Colors.text,
    marginBottom: 15,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: Fonts.regular,
    color: Colors.grayDarkText,
    marginBottom: 24,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
});
