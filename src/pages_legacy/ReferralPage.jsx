import React, { useState } from "react";
import "./ReferralPage.css";

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const code = "TRAVEL2024";
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${code}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="referral-page">
      <div className="page-hero">
        <h1>Invite friends</h1>
        <p>Share the love, earn rewards</p>
      </div>
      <div className="referral-card">
        <p>Your referral code</p>
        <code className="referral-code">{code}</code>
        <p className="share-label">Share link</p>
        <code className="share-url">{shareUrl}</code>
        <button type="button" className="btn btn-primary" onClick={copyLink}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
