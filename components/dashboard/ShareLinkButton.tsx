'use client';

import { useState } from 'react';

// Builds the bride's magic-link URL from the current origin rather than an
// env var — correct on localhost during testing and on the real domain in
// production with zero config.
export function ShareLinkButton({ shareToken }: { shareToken: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/my-dress/${shareToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context) — fail quietly,
      // there is no sensitive data at stake in just not copying.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="font-body text-[12px] uppercase tracking-[0.08em] text-ink underline decoration-border-l underline-offset-4"
    >
      {copied ? 'Link Copied' : 'Copy Bride Link'}
    </button>
  );
}
