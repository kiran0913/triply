import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/Auth/LoginScreen";
import SignupScreen from "../screens/Auth/SignupScreen";

const Stack = createStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: "Log in" }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: "Sign up" }} />
    </Stack.Navigator>
  );
}
