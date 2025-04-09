import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
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
    if (!name.trim()) return;
    if (players.length >= 8) return;
    setPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: name.trim() },
    ]);
    setName("");
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>참가자 목록</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="이름 입력"
          style={styles.input}
        />
        <Pressable style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addText}>추가</Text>
        </Pressable>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id}
        horizontal
        contentContainerStyle={{ gap: 8 }}
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
  wrapper: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: Colors.text,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.grayDarkText,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.white,
  },
  addButton: {
    marginLeft: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  addText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  tag: {
    backgroundColor: Colors.grayBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
});
