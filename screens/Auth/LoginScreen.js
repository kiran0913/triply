import React, { useState } from "react";
import { View, TextInput, Button, StyleSheet, Alert } from "react-native";
import { supabase } from "../../supabase/config";

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, justifyContent: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
});

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const login = async () => {
    const e = email.trim();
    if (!e || !password) {
      Alert.alert("Missing info", "Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: e, password });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("Invalid login") || msg.includes("invalid_credentials")) {
          Alert.alert("Login failed", "Incorrect email or password.");
        } else {
          Alert.alert("Login failed", error.message || "Could not log in.");
        }
      }
    } catch (err) {
      Alert.alert("Login failed", err?.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? "Logging in…" : "Login"} onPress={login} disabled={loading} />
    </View>
  );
}
