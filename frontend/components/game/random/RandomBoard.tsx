import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { Player } from "@/app/games/random";
import Colors from "@/constants/Colors";

const { width, height } = Dimensions.get("window");

interface Props {
  players: Player[];
  winner: Player | null;
  setWinner: (winner: Player | null) => void;
  reset: () => void;
}

export default function RandomBoard({ players, winner, setWinner }: Props) {
  const [visible, setVisible] = useState(false);
  const positions = useRef<Animated.ValueXY[]>([]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (players.length > 0) {
      positions.current = players.map(
        () =>
          new Animated.ValueXY({
            x: Math.random() * (width - 100),
            y: Math.random() * (height - 300),
          })
      );
    }
  }, [players]);

  const animateNames = () => {
    const animations = positions.current.map((pos) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(pos, {
            toValue: {
              x: Math.random() * (width - 100),
              y: Math.random() * (height - 300),
            },
            duration: 400,
            useNativeDriver: false,
          }),
        ])
      )
    );

    Animated.stagger(100, animations).start();

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
  };

  return (
    <View style={styles.wrapper}>
      {!started && (
        <Pressable
          style={[
            styles.pickButton,
            players.length < 2 && { opacity: 0.5 },
          ]}
          onPress={animateNames}
          disabled={players.length < 2}
        >
          <Text style={styles.pickText}>랜덤 뽑기 시작!</Text>
        </Pressable>
      )}

      {players.map((player, index) => {
        const pos = positions.current[index];
        return (
          <Animated.View
            key={player.id}
            style={[
              styles.nameBox,
              pos?.getTranslateTransform
                ? {
                    transform: pos.getTranslateTransform(),
                  }
                : {},
            ]}
          >
            <Text style={styles.nameText}>{player.name}</Text>
          </Animated.View>
        );
      })}

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
    alignItems: "center",
    justifyContent: "center",
  },
  pickButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 24,
    zIndex: 10,
  },
  pickText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  nameBox: {
    position: "absolute",
    backgroundColor: Colors.grayBackground,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  nameText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
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
