import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FeedScreen from "../screens/FeedScreen";
import CreatePostScreen from "../screens/CreatePostScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChatScreen from "../screens/ChatScreen";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#007BFF", // Electric Blue
        tabBarInactiveTintColor: "#9E9E9E",
        tabBarLabelStyle: { fontSize: 12, marginBottom: 4 },
        tabBarStyle: {
          backgroundColor: "#fff",
          borderTopColor: "#eee",
          height: 56 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconSize = size ?? 26;
          let name = "ellipse";
          if (route.name === "Discover") name = focused ? "search" : "search-outline";
          if (route.name === "Create Trip")
            name = focused ? "add-circle" : "add-circle-outline";
          if (route.name === "Chats") name = focused ? "chatbubble" : "chatbubble-outline";
          if (route.name === "Profile") name = focused ? "person-circle" : "person-circle-outline";
          return <Ionicons name={name} size={iconSize} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Discover" component={FeedScreen} />
      <Tab.Screen name="Create Trip" component={CreatePostScreen} />
      <Tab.Screen name="Chats" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
