import React, { useState } from "react";
import { MOCK_POSTS } from "../data/mockData";
import PostCard from "../components/PostCard";
import { INTEREST_TAGS } from "../../utils/constants";
import "./FeedPage.css";

export default function FeedPage() {
  const [posts] = useState(MOCK_POSTS);
  const [selectedTag, setSelectedTag] = useState(null);

  const filtered = selectedTag
    ? posts.filter((p) => (p.interestTags || []).includes(selectedTag))
    : posts;

  return (
    <div className="feed-page">
      <div className="feed-hero">
        <h1>Discover Your Next Escape</h1>
        <p>Curated adventures for discerning travelers</p>
      </div>
      <div className="filter-chips">
        <button type="button" className={`chip ${!selectedTag ? "active" : ""}`} onClick={() => setSelectedTag(null)}>
          All
        </button>
        {INTEREST_TAGS.map((tag) => (
          <button key={tag} type="button" className={`chip ${selectedTag === tag ? "active" : ""}`} onClick={() => setSelectedTag(tag)}>
            {tag}
          </button>
        ))}
      </div>
      <div className="post-list">
        {filtered.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
