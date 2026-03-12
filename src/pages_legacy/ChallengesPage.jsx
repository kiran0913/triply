import React, { useState } from "react";
import { MOCK_CHALLENGES } from "../data/mockData";
import "./ChallengesPage.css";

export default function ChallengesPage() {
  const [challenges] = useState(MOCK_CHALLENGES);

  return (
    <div className="challenges-page">
      <div className="page-hero">
        <h1>Challenges</h1>
        <p>Push your limits, earn rewards</p>
      </div>
      <div className="challenges-grid">
        {challenges.map((c) => (
          <article key={c.id} className="challenge-card">
            <h3>{c.title}</h3>
            <p>{c.description}</p>
            <p className="challenge-meta">{c.participantCount} participants</p>
            <button type="button" className="btn btn-primary btn-sm">Join</button>
          </article>
        ))}
      </div>
    </div>
  );
}
