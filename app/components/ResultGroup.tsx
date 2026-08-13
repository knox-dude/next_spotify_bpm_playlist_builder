import { useState } from 'react';
import Image from 'next/image';
import { Album, Check, ChevronDown } from 'lucide-react';
import { TrackGroup } from '../lib/grouping';
import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import ResultSong from './ResultSong';

interface ResultGroupProps {
  group: TrackGroup;
}

/**
 * One bucket of matches - an artist, an album, a genre, a tempo band - with its
 * songs behind a disclosure.
 */
function ResultGroup({ group }: ResultGroupProps) {
  const [expanded, setExpanded] = useState<boolean>(false);
  const { selectedSongs, selectSongs, clearSongs } = useSelectedSongs();

  const selectedIds = new Set(selectedSongs.map((song) => song.id));
  const selectedCount = group.tracks.filter((track) =>
    selectedIds.has(track.id),
  ).length;
  const allSelected = selectedCount === group.tracks.length;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-paper-700/70">
      <div className="flex items-center gap-2 p-2 sm:p-3">
        <button
          type="button"
          aria-pressed={allSelected}
          aria-label={`Select every song in ${group.label}`}
          onClick={() =>
            allSelected ? clearSongs(group.tracks) : selectSongs(group.tracks)
          }
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            allSelected
              ? 'border-primary bg-primary text-black'
              : selectedCount > 0
                ? 'border-primary/60 text-primary'
                : 'border-white/20 text-transparent hover:border-white/40'
          }`}
        >
          {allSelected ? (
            <Check size={15} strokeWidth={3} />
          ) : (
            <span
              className={`h-2 w-2 rounded-sm ${
                selectedCount > 0 ? 'bg-primary' : 'bg-transparent'
              }`}
            />
          )}
        </button>

        <button
          type="button"
          aria-expanded={expanded}
          onClick={() => setExpanded((prev) => !prev)}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-1 py-1 text-left transition hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          {group.image ? (
            <Image
              src={group.image}
              alt=""
              width={96}
              height={96}
              className="aspect-square h-12 w-12 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14"
            />
          ) : (
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-paper-500 text-gray-dark sm:h-14 sm:w-14">
              <Album size={20} />
            </span>
          )}

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold sm:text-base">
              {group.label}
            </span>
            <span className="block truncate text-xs text-gray-500">
              {group.sublabel}
              {selectedCount > 0 && (
                <span className="text-primary"> · {selectedCount} picked</span>
              )}
            </span>
          </span>

          <ChevronDown
            aria-hidden="true"
            size={20}
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {expanded && (
        <div className="space-y-1 border-t border-white/5 p-2 sm:p-3">
          {group.tracks.map((track) => (
            <ResultSong key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ResultGroup;
