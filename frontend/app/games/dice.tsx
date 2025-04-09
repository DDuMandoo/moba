// app/games/dice.tsx
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import PlayerSelector from "@/components/game/dice/PlayerSelector";
import DiceBoard from "@/components/game/dice/DiceBoard";
import ResultBoard from "@/components/game/dice/ResultBoard";
import Colors from "@/constants/Colors";

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export default function DiceGame() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [round, setRound] = useState(3);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [isFinished, setIsFinished] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const handleRestart = () => {
    setPlayers([]);
    setRound(3);
    setCurrentTurn(0);
    setCurrentRound(1);
    setIsFinished(false);
    setIsStarted(false);
  };

  return (
    <View style={styles.container}>
      {!isStarted && (
        <PlayerSelector
          players={players}
          setPlayers={setPlayers}
          round={round}
          setRound={setRound}
          isStarted={isStarted}
        />
      )}

      {isFinished ? (
        <ResultBoard players={players} onRestart={handleRestart} />
      ) : (
        <DiceBoard
          players={players}
          setPlayers={setPlayers}
          round={round}
          currentRound={currentRound}
          setCurrentRound={setCurrentRound}
          currentTurn={currentTurn}
          setCurrentTurn={setCurrentTurn}
          setIsFinished={setIsFinished}
          isStarted={isStarted}
          setIsStarted={setIsStarted}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: 24,
    justifyContent: "space-between",
  },
});
