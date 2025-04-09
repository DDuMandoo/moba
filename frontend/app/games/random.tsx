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

  const reset = () => {
    setWinner(null);
  };

  return (
    <View style={styles.container}>
      {!winner && (
        <PlayerSelector players={players} setPlayers={setPlayers} />
      )}
      <RandomBoard players={players} winner={winner} setWinner={setWinner} reset={reset} />
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
