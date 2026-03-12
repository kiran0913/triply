import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import DashboardLayout from "./components/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import MatchesPage from "./pages/MatchesPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import CreateTripPage from "./pages/CreateTripPage";
import ExplorePage from "./pages/ExplorePage";
import PlaceholderPage from "./pages/PlaceholderPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/" element={<DashboardLayout />}>
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="matches" element={<MatchesPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="profile/:id" element={<ProfilePage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="create" element={<CreateTripPage />} />
        <Route path="explore" element={<ExplorePage />} />
      </Route>
      <Route path="/about" element={<PlaceholderPage />} />
      <Route path="/contact" element={<PlaceholderPage />} />
      <Route path="/privacy" element={<PlaceholderPage />} />
      <Route path="/terms" element={<PlaceholderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
