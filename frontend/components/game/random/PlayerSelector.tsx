import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
} from "react-native";
import { Player } from "@/app/games/random";
import Colors from "@/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import CustomAlert from "@/components/CustomAlert";

interface Props {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  started: boolean;
}

export default function PlayerSelector({ players, setPlayers, started }: Props) {
  const [name, setName] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || started) return;
    if (players.length >= 20) {
      setAlertVisible(true);
      return;
    }
    setPlayers((prev) => [
      ...prev,
      { id: Date.now().toString(), name: name.trim() },
    ]);
    setName("");
  };

  const handleRemove = (id: string) => {
    if (started) return;
    setPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <View>
      <Text style={styles.title}>참가자 추가</Text>
      <View style={styles.inputWrapper}>
        <Ionicons name="person-outline" size={20} color="#999" style={styles.inputIcon} />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="이름을 입력하세요"
          editable={!started}
          style={[
            styles.input,
            started && { backgroundColor: Colors.grayBackground },
          ]}
          placeholderTextColor="#aaa"
        />
        <Pressable
          style={[
            styles.button,
            (started || players.length >= 20) && { opacity: 0.5 },
          ]}
          onPress={handleAdd}
          disabled={started || players.length >= 20}
        >
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
            <Pressable
              onPress={() => handleRemove(item.id)}
              disabled={started}
            >
              <Ionicons
                name="close"
                size={16}
                color={Colors.grayDarkText}
                style={{ marginLeft: 6 }}
              />
            </Pressable>
          </View>
        )}
      />

      <CustomAlert
        visible={alertVisible}
        title="참가자 초과"
        message="최대 20명까지 추가할 수 있어요!"
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: Colors.text,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 6,
  },
  button: {
    marginLeft: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.logoInner,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
});
