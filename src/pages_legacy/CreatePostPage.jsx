import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { INTEREST_TAGS, TRIP_PRIVACY } from "../../utils/constants";
import "./CreatePostPage.css";

const PRIVACY_OPTIONS = [
  { value: TRIP_PRIVACY.PUBLIC, label: "Public" },
  { value: TRIP_PRIVACY.FRIENDS_ONLY, label: "Friends only" },
  { value: TRIP_PRIVACY.PRIVATE, label: "Private" },
];

export default function CreatePostPage() {
  const { user } = useContext(AuthContext) || {};
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [privacy, setPrivacy] = useState(TRIP_PRIVACY.PUBLIC);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitted(true);
    setTimeout(() => navigate("/"), 1500);
  };

  return (
    <div className="create-post-page">
      <div className="create-hero">
        <h1>Create your trip</h1>
        <p>Share your adventure and find like-minded travelers</p>
      </div>
      {submitted ? (
        <div className="success-message">
          <span className="success-icon">✨</span>
          <h2>Trip created!</h2>
          <p>Redirecting to feed…</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>Trip title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Bali Surf & Yoga Retreat" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your trip and what you're looking for" rows={4} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Bali, Indonesia" />
          </div>
          <div className="form-group">
            <label>Privacy</label>
            <div className="chip-row">
              {PRIVACY_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" className={`chip ${privacy === opt.value ? "active" : ""}`} onClick={() => setPrivacy(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Interest tags</label>
            <div className="chip-row">
              {INTEREST_TAGS.map((tag) => (
                <button key={tag} type="button" className={`chip ${selectedTags.includes(tag) ? "active" : ""}`} onClick={() => toggleTag(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-submit" disabled={!title.trim()}>
            Create Trip
          </button>
        </form>
      )}
    </div>
  );
}
