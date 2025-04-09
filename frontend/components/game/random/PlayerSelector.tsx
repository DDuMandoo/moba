import React, { useState } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet, FlatList
} from "react-native";
import { Player } from "@/app/games/random";
import Colors from "@/constants/Colors";

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
}

export default function PlayerSelector({ players, setPlayers }: Props) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim() || players.length >= 8) return;
    setPlayers((prev) => [...prev, { id: Date.now().toString(), name: name.trim() }]);
    setName("");
  };

  return (
    <View>
      <Text style={styles.title}>참가자 추가</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="이름"
          style={styles.input}
        />
        <Pressable style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>추가</Text>
        </Pressable>
      </View>
      <FlatList
        horizontal
        data={players}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <View style={styles.tag}>
            <Text>{item.name}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12, color: Colors.text },
  inputRow: { flexDirection: "row", marginBottom: 16 },
  input: {
    flex: 1, borderWidth: 1, borderColor: "#ccc",
    borderRadius: 6, paddingHorizontal: 10, backgroundColor: Colors.white
  },
  button: {
    marginLeft: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  tag: {
    backgroundColor: Colors.grayBackground,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
});
