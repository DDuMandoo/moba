// ✅ app/games/random.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import PlayerSelector from "@/components/game/random/PlayerSelector";
import RandomBoard from "@/components/game/random/RandomBoard";
import Colors from "@/constants/Colors";

export interface Player {
  id: string;
  name: string;
}

export default function RandomGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [started, setStarted] = useState(false); // ✅ 상태 추가

  const reset = () => {
    setWinner(null);
    setPlayers([]);        // ✅ 당첨자 확인 후 참가자 리스트 초기화
  };

  return (
    <View style={styles.container}>
      <PlayerSelector
        players={players}
        setPlayers={setPlayers}
        started={started}  // ✅ 누락된 props 전달
      />
      <RandomBoard
        players={players}
        winner={winner}
        setWinner={setWinner}
        reset={reset}
        setPlayers={setPlayers} // ✅ 이거도 필요
        setStarted={setStarted} // ✅ 회전 시작/끝 관리
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
});
