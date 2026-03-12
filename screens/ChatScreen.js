import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20, justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#333", textAlign: "center" },
  hint: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 24 },
  btn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, backgroundColor: "#2196F3", alignSelf: "center" },
  btnText: { color: "#fff", fontWeight: "600" },
});

export default function ChatScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chats</Text>
      <Text style={styles.hint}>
        After a trip or chat, rate your travel buddy to help build trust.
      </Text>
      <TouchableOpacity
        style={styles.btn}
        onPress={() =>
          navigation?.navigate?.("RateUser", {
            toUserId: "other_user_id",
            toUsername: "Travel Buddy",
          })
        }
      >
        <Text style={styles.btnText}>Rate a user (demo)</Text>
      </TouchableOpacity>
    </View>
  );
}
