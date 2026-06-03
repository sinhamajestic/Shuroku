'use client';

import { useState } from 'react';

export function SealButton({ saved, onAdd }: { saved: boolean; onAdd: () => void }) {
  const [stamping, setStamping] = useState(false);

  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (saved) return;
    setStamping(true);
    onAdd();
    setTimeout(() => setStamping(false), 480);
  };

  return (
    <button
      type="button"
      className={`seal ${saved ? 'saved' : ''} ${stamping ? 'stamping' : ''}`}
      onClick={handle}
      aria-label={saved ? 'In your archive' : 'Add to archive'}
      title={saved ? 'In your archive' : 'Add to archive'}
    >
      {saved || stamping ? (
        <svg viewBox="0 0 24 24" className="ic ic-sm">
          <path d="m6 12 4 4 8-9" className="check-path" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="ic ic-sm">
          <path d="M12 5v14M5 12h14" />
        </svg>
      )}
    </button>
  );
}
