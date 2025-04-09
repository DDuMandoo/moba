import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import { Player } from "@/app/games/random";
import Colors from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

interface Props {
  players: Player[];
  winner: Player | null;
  setWinner: (player: Player) => void;
  reset: () => void;
}

export default function RandomBoard({
  players,
  winner,
  setWinner,
  reset,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [positions, setPositions] = useState<Animated.ValueXY[]>([]);

  useEffect(() => {
    const init = players.map(() => new Animated.ValueXY({ x: 0, y: 0 }));
    setPositions(init);
  }, [players]);

  const animateCapsules = () => {
    players.forEach((_, i) => {
      const randX = Math.random() * width - width / 2;
      const randY = Math.random() * height - height / 2;

      Animated.spring(positions[i], {
        toValue: { x: randX, y: randY },
        useNativeDriver: true,
        speed: 2,
        bounciness: 10,
      }).start();
    });
  };

  const handlePick = () => {
    if (players.length < 2) return;
    animateCapsules();

    setTimeout(() => {
      const winnerIndex = Math.floor(Math.random() * players.length);
      setWinner(players[winnerIndex]);
      setVisible(true);
    }, 2000);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.capsuleContainer}>
        {players.map((player, i) => (
          <Animated.View
            key={player.id}
            style={[
              styles.capsule,
              {
                transform: positions[i]
                  ? positions[i].getTranslateTransform()
                  : [],
              },
            ]}
          >
            <Text style={styles.capsuleText}>{player.name}</Text>
          </Animated.View>
        ))}
      </View>

      <Pressable
        style={[styles.pickButton, players.length < 2 && { opacity: 0.4 }]}
        onPress={handlePick}
        disabled={players.length < 2}
      >
        <Text style={styles.pickText}>랜덤 뽑기 시작!</Text>
      </Pressable>

      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.winnerText}>
              🎉 {winner?.name} 님 당첨! 🎉
            </Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                setVisible(false);
                reset();
              }}
            >
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
    alignItems: "center",
    justifyContent: "center",
  },
  capsuleContainer: {
    flex: 1,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 100,
  },
  capsule: {
    position: "absolute",
    backgroundColor: Colors.grayBackground,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  capsuleText: {
    fontWeight: "600",
    color: Colors.text,
  },
  pickButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  pickText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: Colors.white,
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    gap: 16,
  },
  winnerText: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.secondary,
  },
  closeButton: {
    backgroundColor: Colors.logo,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});
