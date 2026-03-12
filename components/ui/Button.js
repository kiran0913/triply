import React from "react";
import { Pressable, StyleSheet, Platform } from "react-native";
import T from "./T";
import { Colors, Spacing } from "../../theme";

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: "#EAEAEA" },
  disabled: { opacity: 0.5 },
});

export default function Button({ title, onPress, variant = "primary", disabled = false, style, textStyle }) {
  const variantStyle = variant === "secondary" ? styles.secondary : styles.primary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      android_ripple={
        Platform.OS === "android" ? { color: "rgba(0,0,0,0.08)", borderless: false } : undefined
      }
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        pressed && Platform.OS === "ios" ? { opacity: 0.85 } : null,
        disabled && styles.disabled,
        style,
      ]}
    >
      <T
        variant="bodyMedium"
        style={[
          { color: variant === "secondary" ? Colors.text : "#fff" },
          textStyle,
        ]}
      >
        {title}
      </T>
    </Pressable>
  );
}

