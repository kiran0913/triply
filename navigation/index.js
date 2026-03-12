import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import AuthNavigator from "./AuthNavigator";
import OnboardingGate from "./OnboardingGate";
import { AuthContext } from "../context/AuthContext";

export default function Navigation() {
  const { user } = useContext(AuthContext);
  return (
    <NavigationContainer>
      {user ? <OnboardingGate /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
