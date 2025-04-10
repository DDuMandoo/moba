import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import { Player } from "@/app/games/dice";
import Colors from "@/constants/Colors";
import CustomAlert from "@/components/CustomAlert";

interface Props {
    players: Player[];
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
    round: number;
    setRound: (r: number) => void;
    isStarted: boolean;
  }

export default function PlayerSelector({
  players,
  setPlayers,
  round,
  setRound,
  isStarted
}: Props) {
  const [name, setName] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  const handleAdd = () => {
    if (!name.trim()) return;
    if (players.length >= 8) {
      setAlertVisible(true);
      return;
    }
    setPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: name.trim(), score: 0 },
    ]);
    setName("");
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.infoText}>주사위 굴리기를 클릭하면 게임이 시작합니다.</Text>
      <View style={styles.inputRow}>
        <TextInput
            value={name}
            onChangeText={setName}
            placeholder="참가자 이름"
            style={styles.input}
            editable={!isStarted} 
        />
        <Pressable
            style={({ pressed }) => [
                styles.addButton,
                isStarted && { opacity: 0.5 },
                pressed && styles.addButtonPressed
            ]}
            onPress={handleAdd}
            disabled={isStarted}
            >
            <Text style={styles.buttonText}>추가</Text>
        </Pressable>
      </View>
      <View style={styles.roundRow}>
        <Text style={styles.label}>라운드 : </Text>
        <View style={styles.roundControl}>
            <Pressable
            style={[styles.roundButton, isStarted && styles.disabledButton]}
            onPress={() => setRound(Math.max(1, round - 1))}
            disabled={isStarted}
            >
                <Text style={styles.roundButtonText}>-</Text>
            </Pressable>

            <Text style={styles.roundValue}>{round}</Text>

            <Pressable
            style={[styles.roundButton, isStarted && styles.disabledButton]}
            onPress={() => setRound(round + 1)}
            disabled={isStarted}
            >
            <Text style={styles.roundButtonText}>+</Text>
            </Pressable>
        </View>
      </View>
      {/* <FlatList
        data={players}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.playerTag}>
            <Text>{item.name}</Text>
          </View>
        )}
      /> */}
      <CustomAlert
        visible={alertVisible}
        title="참가자 초과"
        message="참가자는 최대 8명까지만 추가할 수 있어요."
        onClose={() => setAlertVisible(false)}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    backgroundColor: Colors.background
  },
  infoText: {
    fontSize: 16,
    color: Colors.grayDarkText,
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
    marginTop: 16,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 6,
  },
  addButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    backgroundColor: Colors.logo,
    justifyContent: "center",
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
  },
  roundRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 10
  },
  control: {
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 12,
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  playerTag: {
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginRight: 8,
  },
  roundControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  roundButton: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  roundButtonText: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "400",
  },
  roundValue: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  disabledButton: {
    backgroundColor: Colors.grayBackground,
  },
  addButtonPressed: {
    backgroundColor: Colors.secondary,
  },  
});
