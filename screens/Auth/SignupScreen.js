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

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email: email.trim(), password });
      if (error) {
        Alert.alert("Signup failed", error.message || "Could not create account.");
        return;
      }
      Alert.alert("Success", "Account created. You are signed in.");
    } catch (err) {
      Alert.alert("Signup failed", err?.message || "Could not create account.");
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
        placeholder="Password (min 6 characters)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title={loading ? "Creating…" : "Sign up"} onPress={signup} disabled={loading} />
      {navigation && (
        <Button
          title="Already have an account? Log in"
          onPress={() => navigation.navigate("Login")}
        />
      )}
    </View>
  );
}
