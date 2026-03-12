import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import MainTabNavigator from "./MainTabNavigator";
import ItineraryViewScreen from "../screens/ItineraryViewScreen";
import RateUserScreen from "../screens/RateUserScreen";
import ReviewsListScreen from "../screens/ReviewsListScreen";
import SafetyCheckInScreen from "../screens/SafetyCheckInScreen";
import CompatibilityQuizScreen from "../screens/CompatibilityQuizScreen";
import ShareTripScreen from "../screens/ShareTripScreen";
import OpenSharedTripScreen from "../screens/OpenSharedTripScreen";
import ChallengesScreen from "../screens/ChallengesScreen";
import ChallengeDetailScreen from "../screens/ChallengeDetailScreen";
import CreateChallengeScreen from "../screens/CreateChallengeScreen";
import ReferralScreen from "../screens/ReferralScreen";
import NotificationPreferencesScreen from "../screens/NotificationPreferencesScreen";
import EventsScreen from "../screens/EventsScreen";
import EventDetailScreen from "../screens/EventDetailScreen";
import CreateEventScreen from "../screens/CreateEventScreen";

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen name="MainTabs" component={MainTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Itinerary" component={ItineraryViewScreen} options={{ title: "Itinerary" }} />
      <Stack.Screen name="RateUser" component={RateUserScreen} options={{ title: "Rate & Review" }} />
      <Stack.Screen name="ReviewsList" component={ReviewsListScreen} options={{ title: "Reviews" }} />
      <Stack.Screen name="SafetyCheckIn" component={SafetyCheckInScreen} options={{ title: "Safety Check-In" }} />
      <Stack.Screen name="CompatibilityQuiz" component={CompatibilityQuizScreen} options={{ title: "Compatibility Quiz" }} />
      <Stack.Screen name="ShareTrip" component={ShareTripScreen} options={{ title: "Share Trip" }} />
      <Stack.Screen name="OpenSharedTrip" component={OpenSharedTripScreen} options={{ title: "Trip" }} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ title: "Challenges" }} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ title: "Challenge" }} />
      <Stack.Screen name="CreateChallenge" component={CreateChallengeScreen} options={{ title: "Create Challenge" }} />
      <Stack.Screen name="Referral" component={ReferralScreen} options={{ title: "Invite Friends" }} />
      <Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ title: "Notifications" }} />
      <Stack.Screen name="Events" component={EventsScreen} options={{ title: "Events & Meetups" }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: "Event" }} />
      <Stack.Screen name="CreateEvent" component={CreateEventScreen} options={{ title: "Create Event" }} />
    </Stack.Navigator>
  );
}
