import React, { useState } from "react";
import { MOCK_EVENTS } from "../data/mockData";
import "./EventsPage.css";

export default function EventsPage() {
  const [events] = useState(MOCK_EVENTS);

  return (
    <div className="events-page">
      <div className="page-hero">
        <h1>Events & Meetups</h1>
        <p>Connect with travelers in person</p>
      </div>
      <div className="events-grid">
        {events.map((ev) => (
          <article key={ev.id} className="event-card">
            <span className="event-type">{ev.type}</span>
            <h3>{ev.title}</h3>
            <p>{ev.description}</p>
            <p className="event-meta">📍 {ev.location}</p>
            <p className="event-date">📅 {new Date(ev.startAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</p>
            <button type="button" className="btn btn-primary btn-sm">Join</button>
          </article>
        ))}
      </div>
    </div>
  );
}
