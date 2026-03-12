import React from "react";
import { StatusBar } from "react-native";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "./context/AuthContext";
import Navigation from "./navigation";

// Workaround for iOS HostFunction boolean/string crash:
// disable react-native-screens native components.
enableScreens(false);

// Log full stack traces to Metro output
if (global?.ErrorUtils?.setGlobalHandler) {
  const defaultHandler = global.ErrorUtils.getGlobalHandler?.();
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    // eslint-disable-next-line no-console
    console.error("GlobalError", { isFatal, message: error?.message, stack: error?.stack });
    if (typeof defaultHandler === "function") defaultHandler(error, isFatal);
  });
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar barStyle="dark-content" />
        <Navigation />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
