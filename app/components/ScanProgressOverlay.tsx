import React from 'react';
import { ScanProgress } from '../lib/generateBpmSongs';

interface ScanProgressOverlayProps {
  progress: ScanProgress | null;
}

const PHASE_COPY: Record<ScanProgress['phase'], { title: string; unit: string }> =
  {
    sources: { title: 'Reading your sources', unit: 'sources' },
    tempos: { title: 'Looking up tempos', unit: 'songs' },
    genres: { title: 'Fetching genres', unit: 'songs' },
  };

/**
 * The waiting screen.
 *
 * A scan of a large library is genuinely slow - it is bounded by two free tempo
 * APIs - so the honest thing is to show what it's doing and how far along it is
 * rather than a spinner and an apology.
 */
const ScanProgressOverlay: React.FC<ScanProgressOverlayProps> = ({
  progress,
}) => {
  const copy = progress ? PHASE_COPY[progress.phase] : null;
  const percent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.done / progress.total) * 100))
      : 0;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/90 px-6 backdrop-blur-sm"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-paper-700/90 p-6 text-center shadow-2xl">
        <span className="relative mx-auto flex h-3 w-3">
          <span className="animate-bpm absolute inline-flex h-full w-full rounded-full bg-primary" />
        </span>

        <p className="mt-5 text-lg font-bold">
          {copy ? copy.title : 'Starting the scan'}
        </p>

        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-paper-600">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>

        <p className="mt-3 text-xs text-gray-500">
          {progress && progress.total > 0 && copy
            ? `${progress.done.toLocaleString()} of ${progress.total.toLocaleString()} ${copy.unit}`
            : 'This can take a minute for a large library.'}
        </p>
      </div>
    </div>
  );
};

export default ScanProgressOverlay;
