import React from "react";
import "./PostCard.css";

export default function PostCard({ post }) {
  const tags = post.interestTags || [];

  return (
    <article className="post-card">
      <span className="post-destination">{post.destination}</span>
      <h3 className="post-title">{post.title}</h3>
      {post.description && <p className="post-description">{post.description}</p>}
      {tags.length > 0 && (
        <div className="post-tags">
          {tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </article>
  );
}
