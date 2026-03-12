import React from "react";
import { Text } from "react-native";
import { Typography } from "../../theme";

export default function T({ children, variant = "body", style, ...props }) {
  const base = Typography[variant] || Typography.body;
  return (
    <Text style={[base, style]} {...props}>
      {children}
    </Text>
  );
}

