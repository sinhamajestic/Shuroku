'use client';

import { posterFallback } from '@/lib/posterFallback';

export function Poster({
  title,
  coverUrl,
  children,
}: {
  title: string;
  coverUrl: string | null;
  children?: React.ReactNode;
}) {
  const fb = posterFallback(title);
  return (
    <div className="poster" style={{ ['--pbase' as string]: fb.base, ['--pacc' as string]: fb.acc }}>
      <div className="card-cover-zoom">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverUrl} alt={title} className="poster-cover" />
        ) : (
          <>
            <div className="poster-grain" />
            <div className="poster-glyph">{fb.glyph}</div>
            <div className="poster-scrim" />
          </>
        )}
      </div>
      {children}
    </div>
  );
}
