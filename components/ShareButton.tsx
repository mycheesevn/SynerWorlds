"use client";

import { useState } from "react";

export default function ShareButton({
  url,
  title,
  shareLabel,
  copyLabel,
  copiedLabel,
}: {
  url: string;
  title: string;
  shareLabel: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    await copy();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <span style={{ display: "inline-flex", gap: 8, flexWrap: "wrap" }}>
      <button className="btn" onClick={share} type="button">
        {shareLabel}
      </button>
      <button className="btn ghost" onClick={copy} type="button">
        {copied ? `✅ ${copiedLabel}` : copyLabel}
      </button>
    </span>
  );
}
