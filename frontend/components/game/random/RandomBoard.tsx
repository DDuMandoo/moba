// ✅ 카드에 로고 이미지 적용 + 원 회전 + 버튼/입력 비활성화 + 모달 시 초기화
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { Player } from '@/app/games/random';
import Colors from '@/constants/Colors';
import { Easing } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SIZE = 70;
const RADIUS = 140;
const centerX = 0;
const centerY = 0;

const Icon = require('@/assets/Icon.png');

interface Props {
  players: Player[];
  winner: Player | null;
  setWinner: (winner: Player | null) => void;
  reset: () => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RandomBoard({ players, winner, setWinner, reset, setPlayers }: Props) {
  const [visible, setVisible] = useState(false);
  const [started, setStarted] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (started) {
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    } else {
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [started]);

  const animateDraw = () => {
    setStarted(true);

    setTimeout(() => {
      const chosen = players[Math.floor(Math.random() * players.length)];
      setWinner(chosen);
      setVisible(true);
      setStarted(false);
    }, 3000);
  };

  const handleReset = () => {
    setWinner(null);
    setVisible(false);
    setPlayers([]);
    reset();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderRotatingCards = () => {
    return players.map((_, index) => {
      const angle = (index / players.length) * 2 * Math.PI;
      const x = RADIUS * Math.cos(angle) - CARD_SIZE / 2;
      const y = RADIUS * Math.sin(angle) - CARD_SIZE / 2;
  
      const baseAngle = (angle * 180) / Math.PI; // 라디안 → 도 단위 변환
  
      return (
        <Animated.View
          key={index}
          style={[
            styles.card,
            {
              position: 'absolute',
              left: x,
              top: y,
              transform: [{ rotate: `${baseAngle}deg` }],
            },
          ]}
        >
          <Animated.Image
            source={Icon}
            style={[
              styles.logo,
              {
                transform: [{ rotate: `${-baseAngle}deg` }],
              },
            ]}
          />
        </Animated.View>

      );
    });
  };
  

  return (
    <View style={styles.wrapper}>
      <View style={styles.zoneContainer}>
        <Image
          source={require('@/assets/images/login_image.png')}
          style={styles.centerImage}
        />
        <Animated.View
          style={[styles.circle, {
            transform: [
              { translateX: centerX },
              { translateY: centerY },
              { rotate: spin },
            ],
          }]}
        >
          {renderRotatingCards()}
        </Animated.View>
      </View>

      <Pressable
        style={[styles.pickButton, players.length < 2 && { opacity: 0.5 }]}
        onPress={animateDraw}
        disabled={players.length < 2 || started}
      >
        <Text style={styles.pickText}>✨ 랜덤 추첨 시작!</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.winnerText}>🎉 {winner?.name} 님 당첨! 🎉</Text>
            <Pressable style={styles.closeButton} onPress={handleReset}>
              <Text style={styles.closeText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  zoneContainer: {
    height: 360,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  centerImage: {
    position: 'absolute',
    width: 140,
    height: 140,
    resizeMode: 'contain',
    zIndex: 5,
    transform: [
      { translateX: 0 },
      { translateY: 0 },
    ],
  },  
  circle: {
    position: 'absolute',
    width: 0,
    height: 0,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    backgroundColor: Colors.white,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: 6,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  pickButton: {
    position: 'absolute',
    bottom: 0,
    left: 80,
    right: 80,
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },  
  pickText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000088',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: Colors.white,
    padding: 28,
    borderRadius: 16,
    alignItems: 'center',
    gap: 20,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.secondary,
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: Colors.logo,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
