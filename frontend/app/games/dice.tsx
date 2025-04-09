import React, { useState } from 'react';
import { View } from 'react-native';
import PlayerSelector from '@/components/game/dice/PlayerSelector';
import DiceBoard from '@/components/game/dice/DiceBoard';
import ResultBoard from '@/components/game/dice/ResultBoard';

export default function DiceGameScreen() {
  const [numPlayers, setNumPlayers] = useState(2);
  const [rounds, setRounds] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [scores, setScores] = useState<number[][]>([]);

  const handleStart = (names: string[]) => {
    setScores(Array.from({ length: names.length }, () => []));
    setPlayerNames(names);
    setGameStarted(true);
  };

  const handleEndGame = (finalScores: number[][]) => {
    setScores(finalScores);
    setGameEnded(true);
  };

  const handleReset = () => {
    setNumPlayers(2);
    setRounds(1);
    setGameStarted(false);
    setGameEnded(false);
    setScores([]);
    setPlayerNames([]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F2F0EF' }}>
      {!gameStarted ? (
        <PlayerSelector
          numPlayers={numPlayers}
          setNumPlayers={setNumPlayers}
          rounds={rounds}
          setRounds={setRounds}
          onStart={handleStart}
        />
      ) : !gameEnded ? (
        <DiceBoard
          playerNames={playerNames}
          rounds={rounds}
          onFinish={handleEndGame}
        />
      ) : (
        <ResultBoard scores={scores} playerNames={playerNames} onRestart={handleReset} />
      )}
    </View>
  );
}
