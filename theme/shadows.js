import { Platform } from "react-native";

export const Shadows = {
  card: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
    },
    android: { elevation: 3 },
    default: {},
  }),
  soft: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
    },
    android: { elevation: 2 },
    default: {},
  }),
};

