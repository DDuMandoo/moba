import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  Animated,
  Pressable,
  StyleSheet,
} from "react-native";
import { Player } from "@/app/games/dice";
import Colors from "@/constants/Colors";
import Dice from "./Dice";

const lookRight = require("../../../assets/images/game/lookRight.png");
const lookLeft = require("../../../assets/images/game/lookLeft.png");
const gameIcon = require("../../../assets/Icon.png");

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  round: number;
  currentRound: number;
  setCurrentRound: (val: number) => void;
  currentTurn: number;
  setCurrentTurn: (val: number) => void;
  setIsFinished: (val: boolean) => void;
  setIsStarted: (val: boolean) => void;
  isStarted: boolean;
}

export default function DiceBoard({
  players,
  setPlayers,
  round,
  currentRound,
  setCurrentRound,
  currentTurn,
  setCurrentTurn,
  setIsFinished,
  isStarted,
  setIsStarted,
}: Props): JSX.Element | null {
  const [rolling, setRolling] = useState(false);
  const [scoreDiff, setScoreDiff] = useState(0);
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const [scaleAnim, setScaleAnim] = useState<Animated.Value[]>([]);
  const [gameEnded, setGameEnded] = useState(false);

  const [diceValue1, setDiceValue1] = useState<number | null>(null);
  const [diceValue2, setDiceValue2] = useState<number | null>(null);

  const rotateAnim1 = useRef(new Animated.Value(0)).current;
  const rotateAnim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animArr = players.map(() => new Animated.Value(1));
    setScaleAnim(animArr);
  }, [players]);

  useEffect(() => {
    scaleAnim.forEach((anim, idx) => {
      Animated.spring(anim, {
        toValue: idx === currentTurn ? 1.4 : 1,
        useNativeDriver: true,
      }).start();
    });
  }, [currentTurn]);

  useEffect(() => {
    if (rolling) {
      Animated.loop(
        Animated.timing(rotateAnim1, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.timing(rotateAnim2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      rotateAnim1.stopAnimation();
      rotateAnim1.setValue(0);
      rotateAnim2.stopAnimation();
      rotateAnim2.setValue(0);
    }
  }, [rolling]);

  const rollDice = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    setDiceValue1(d1);
    setDiceValue2(d2);

    if (!isStarted) setIsStarted(true);
    setRolling(true);
    setScoreDiff(0);

    setTimeout(() => {
      const total = d1 + d2;
      setRolling(false);
      setScoreDiff(total);

      Animated.sequence([
        Animated.timing(scoreAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scoreAnim, {
          toValue: 0,
          duration: 300,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        setPlayers((prev) =>
          prev.map((p, idx) =>
            idx === currentTurn ? { ...p, score: p.score + total } : p
          )
        );
      }, 300);

      setTimeout(() => {
        goToNextTurn();
      }, 1500);
    }, 2000);
  };

  const goToNextTurn = () => {
    const isLastPlayer = currentTurn === players.length - 1;
    const isLastRound = currentRound === round;

    if (isLastPlayer) {
      if (isLastRound) {
        setIsFinished(true);
        setGameEnded(true);
        return;
      }
      setCurrentRound(currentRound + 1);
      setCurrentTurn(0);
    } else {
      setCurrentTurn(currentTurn + 1);
    }
  };

  const spin1 = rotateAnim1.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const spin2 = rotateAnim2.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const renderPlayers = (filterFn: (idx: number) => boolean, icon: any) =>
    players.filter((_, idx) => filterFn(idx)).map((p, index) => {
      const realIndex = players.indexOf(p);
      return (
        <Animated.View key={p.id} style={[styles.playerContainer, { transform: [{ scale: scaleAnim[realIndex] || new Animated.Value(1) }] }]}>
          <Image source={icon} style={styles.avatar} />
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.score}>{p.score}점</Text>
          {realIndex === currentTurn && scoreDiff > 0 && (
            <Animated.Text style={[styles.scoreUp, {
              opacity: scoreAnim,
              transform: [{ translateY: scoreAnim.interpolate({ inputRange: [0, 1], outputRange: [10, -10] }) }],
            }]}>+{scoreDiff}</Animated.Text>
          )}
        </Animated.View>
      );
    });

  return (
    <View style={styles.wrapper}>
      <View style={styles.roundInfo}>
        <Text style={styles.roundText}>
          <Text style={styles.roundNumber}>{currentRound}</Text>라운드 / {round}라운드
        </Text>
      </View>

      {gameEnded ? (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>🏆 최종 순위</Text>
          {players.sort((a, b) => b.score - a.score).map((p, idx) => (
            <Text key={p.id} style={styles.resultItem}>
              {idx + 1}위 - {p.name} ({p.score}점)
            </Text>
          ))}
        </View>
      ) : (
        <View style={styles.rowBody}>
          <View style={styles.sideColumn}>
            {renderPlayers((idx) => idx % 2 === 0, lookRight)}
          </View>

          <View style={styles.diceWrapper}>
            <Dice value={diceValue1} rolling={rolling} />
            <Dice value={diceValue2} rolling={rolling} />
          </View>

          <View style={styles.sideColumn}>
            {renderPlayers((idx) => idx % 2 === 1, lookLeft)}
          </View>
        </View>
      )}

      {!gameEnded && (
        <Pressable
            style={[
            styles.rollButton,
            rolling && { opacity: 0.5 }, // 👈 비활성화 상태 스타일
            ]}
            onPress={rollDice}
            disabled={rolling} // 이미 비활성화 기능은 들어가 있음!
        >
          <Text style={styles.rollText}>주사위 굴리기</Text>
        </Pressable>      
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: Colors.background, paddingTop: 10 },
  rowBody: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  roundInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  roundText: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },
  roundNumber: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.secondary,
  },
  resultBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 12,
  },
  resultItem: {
    fontSize: 16,
    color: Colors.text,
  },
  sideColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 20,
  },
  diceWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  icon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  playerContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  score: {
    fontSize: 14,
    color: Colors.grayDarkText,
  },
  scoreUp: {
    position: 'absolute',
    top: -14,
    fontSize: 16,
    color: '#ff4444',
    fontWeight: 'bold',
  },
  rollButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 16,
  },
  rollText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
