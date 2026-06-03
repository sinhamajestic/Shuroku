'use client';

import { useRouter } from 'next/navigation';
import { Poster } from './Poster';
import { SealButton } from './SealButton';
import { STATUS_META, type WatchStatus } from '@/types/api';

export interface PosterCardProps {
  animeId: string;
  title: string;
  coverUrl: string | null;
  year?: number | null;
  episodes?: number | null;
  format?: string | null;
  status?: WatchStatus | null;
  progressEp?: number;
  index?: number;
  saved?: boolean;
  onAdd?: () => void;
  onIncrement?: () => void;
}

export function PosterCard({
  animeId,
  title,
  coverUrl,
  year,
  episodes,
  format,
  status,
  progressEp = 0,
  index = 0,
  saved = false,
  onAdd,
  onIncrement,
}: PosterCardProps) {
  const router = useRouter();
  const inLib = Boolean(status);
  const meta = status ? STATUS_META[status] : null;
  const pct = episodes ? Math.min(100, Math.round((progressEp / episodes) * 100)) : 0;
  const open = () => router.push(`/anime/${animeId}`);

  return (
    <article
      className="card in"
      style={{ animationDelay: `${Math.min(index, 12) * 40}ms` }}
      onClick={open}
      onKeyDown={(e) => e.key === 'Enter' && open()}
      tabIndex={0}
      role="button"
      aria-label={title}
    >
      <Poster title={title} coverUrl={coverUrl}>
        {meta && <div className="spine" style={{ background: meta.hue }} />}
        {!inLib && !saved && onAdd && <SealButton saved={false} onAdd={onAdd} />}
        {saved && (
          <div className="seal saved" style={{ cursor: 'default' }} aria-label="In your archive">
            <svg viewBox="0 0 24 24" className="ic ic-sm">
              <path d="m6 12 4 4 8-9" className="check-path" />
            </svg>
          </div>
        )}
        {inLib && status === 'COMPLETED' && (
          <div className="seal saved" style={{ cursor: 'default' }} aria-label="Completed">
            <svg viewBox="0 0 24 24" className="ic ic-sm">
              <path d="m6 12 4 4 8-9" className="check-path" />
            </svg>
          </div>
        )}
        {inLib && episodes ? (
          <>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${pct}%` }} />
            </div>
            {onIncrement && progressEp < episodes && (
              <div className="card-quick">
                <button
                  className="quick-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onIncrement();
                  }}
                >
                  <svg viewBox="0 0 24 24" className="ic">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  EP {progressEp + 1}
                </button>
              </div>
            )}
          </>
        ) : null}
      </Poster>
      <div>
        <div className="card-title">{title}</div>
        <div className="card-meta">
          {[year, format, episodes && `${inLib ? `${progressEp}/${episodes}` : `${episodes} ep${episodes === 1 ? '' : 's'}`}`]
            .filter(Boolean)
            .join(' · ')}
        </div>
      </div>
    </article>
  );
}
