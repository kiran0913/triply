import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Spacing } from "../../theme";

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.screen },
  padded: { padding: Spacing.lg },
});

export default function Screen({ children, style, padded = false, edges = ["top", "left", "right"] }) {
  return (
    <SafeAreaView style={[styles.root, padded && styles.padded, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
}

