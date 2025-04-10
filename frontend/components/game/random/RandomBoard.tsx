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
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Player } from '@/app/games/random';
import Colors from '@/constants/Colors';
import { Easing } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_SIZE = 60;
const RADIUS = 125;

const Icon = require('@/assets/Icon.png');

interface Props {
  players: Player[];
  winner: Player | null;
  setWinner: (winner: Player | null) => void;
  reset: () => void;
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  setStarted: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function RandomBoard({
  players,
  winner,
  setWinner,
  reset,
  setPlayers,
  setStarted,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [started, setInternalStarted] = useState(false);
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
    setInternalStarted(true);
    setStarted(true);

    setTimeout(() => {
      const chosen = players[Math.floor(Math.random() * players.length)];
      setWinner(chosen);
      setVisible(true);
      setInternalStarted(false);
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
      const baseAngle = (angle * 180) / Math.PI;

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
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.zoneContainer}>
          <Image
            source={require('@/assets/images/login_image.png')}
            style={styles.centerImage}
          />
          <Animated.View
            style={[
              styles.circle,
              {
                transform: [{ rotate: spin }],
              },
            ]}
          >
            {renderRotatingCards()}
          </Animated.View>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            style={[
              styles.pickButton,
              (players.length < 2 || started) && { opacity: 0.5 },
            ]}
            onPress={animateDraw}
            disabled={players.length < 2 || started}
          >
            <Text style={styles.pickText}>✨ 랜덤 추첨 시작!</Text>
          </Pressable>
        </View>
      </ScrollView>

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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: 0,
  },
  zoneContainer: {
    height: 340,
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
  buttonContainer: {
    marginTop: 30,
    marginBottom: 30,
  },
  pickButton: {
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
    backgroundColor: Colors.primary,
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
