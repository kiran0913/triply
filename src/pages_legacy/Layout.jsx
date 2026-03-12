import React, { useState } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import OnboardingPage from "./OnboardingPage";
import "./Layout.css";

export default function Layout() {
  const { user } = React.useContext(AuthContext);
  const location = useLocation();
  const [onboardingComplete] = useState(true);

  const navLink = (path, label) => (
    <Link to={path} className={`nav-link ${location.pathname === path ? "active" : ""}`}>
      {label}
    </Link>
  );

  if (!onboardingComplete) {
    return <OnboardingPage onComplete={() => {}} />;
  }

  return (
    <div className="layout layout-inner">
      <header className="header-glass">
        <Link to="/" className="logo">Travel Buddy</Link>
        <nav className="nav">
          {navLink("/discover", "Discover")}
          {navLink("/create", "Create Trip")}
          {navLink("/events", "Experiences")}
          {navLink("/challenges", "Challenges")}
          {navLink("/profile", "Profile")}
        </nav>
        <span className="user-badge">{user?.email}</span>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
