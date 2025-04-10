// components/game/dice/ResultBoard.tsx
import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Player } from "@/app/games/dice";
import Colors from "@/constants/Colors";

interface Props {
  players: Player[];
  onRestart?: () => void;
}

export default function ResultBoard({ players, onRestart }: Props) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  const renderItem = ({
    item,
    index,
  }: {
    item: Player;
    index: number;
  }) => {
    let rankDisplay = `${index + 1}위`;
  
    if (index === 0) rankDisplay = "🥇";
    else if (index === 1) rankDisplay = "🥈";
    else if (index === 2) rankDisplay = "🥉";
  
    return (
      <View style={[styles.row, index === 0 && styles.firstRow]}>
        <Text style={[styles.rank, index === 0 && styles.firstText]}>
          {rankDisplay}
        </Text>
        <Text style={[styles.name, index === 0 && styles.firstText]}>
          {item.name}
        </Text>
        <Text style={[styles.score, index === 0 && styles.firstText]}>
          {item.score}점
        </Text>
      </View>
    );
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏁 게임 종료!</Text>
      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
      />
      {onRestart && (
        <Pressable style={styles.restartButton} onPress={onRestart}>
          <Text style={styles.restartText}>다시 하기</Text>
        </Pressable>
      )}
    </View>
  );
}

interface Style {
  container: ViewStyle;
  title: TextStyle;
  row: ViewStyle;
  firstRow: ViewStyle;
  firstText: TextStyle;
  rank: TextStyle;
  name: TextStyle;
  score: TextStyle;
  restartButton: ViewStyle;
  restartText: TextStyle;
}

const styles = StyleSheet.create<Style>({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    marginBottom: 30,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
  },
  firstRow: {
    backgroundColor: Colors.logo, // 골드 느낌
  },
  firstText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  rank: {
    fontSize: 18,
    width: 68,
  },
  name: {
    flex: 1,
    fontSize: 18,
  },
  score: {
    fontSize: 18,
    width: 80,
    textAlign: "right",
  },
  restartButton: {
    marginTop: 24,
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  restartText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "500",
  },
});
