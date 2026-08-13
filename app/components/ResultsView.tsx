import React, { useMemo, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ScanResult } from '../lib/generateBpmSongs';
import {
  GROUP_BY_LABELS,
  GroupBy,
  SORT_BY_LABELS,
  SortBy,
  groupTracks,
} from '../lib/grouping';
import { TrackWithAudioFeature } from '../types/updatedTypes';
import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import ResultGroup from './ResultGroup';
import SaveSongsButton from './SaveSongsButton';
import TextInput from './TextInput';
import { CARD, GHOST_BUTTON, SECTION_LABEL } from './ui/styles';

interface ResultsViewProps {
  result: ScanResult;
  onBack: () => void;
  playlistName: string;
  setPlaylistName: (name: string) => void;
  onSave: (
    songs: TrackWithAudioFeature[],
    newWindow: Window | null,
  ) => void | Promise<void>;
  saving: boolean;
}

const GROUP_OPTIONS: GroupBy[] = ['artist', 'album', 'genre', 'tempo'];
const SORT_OPTIONS: SortBy[] = ['size', 'name', 'tempo'];

/**
 * The matches, and what to do with them.
 *
 * Results are bucketed by artist, album, genre or tempo rather than by the
 * playlist a song came from: by this point every match is just a song at the
 * right tempo, and where it was found says nothing about whether it belongs in
 * the playlist being built.
 */
function ResultsView({
  result,
  onBack,
  playlistName,
  setPlaylistName,
  onSave,
  saving,
}: ResultsViewProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('artist');
  const [sortBy, setSortBy] = useState<SortBy>('size');
  const { selectedSongs, selectSongs, clearSongs } = useSelectedSongs();

  const groups = useMemo(
    () => groupTracks(result.tracks, groupBy, sortBy),
    [result.tracks, groupBy, sortBy],
  );

  const matchCount = result.tracks.length;

  if (matchCount === 0) {
    return (
      <div className="flex flex-col gap-6">
        <button type="button" onClick={onBack} className={`self-start ${GHOST_BUTTON}`}>
          <span className="flex items-center gap-2">
            <ArrowLeft size={16} aria-hidden="true" /> Back to the builder
          </span>
        </button>
        <div className={`${CARD} p-10 text-center`}>
          <p className="text-xl font-bold">No songs in that range</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
            We looked at {result.scannedCount.toLocaleString()} songs and none
            of them landed in your BPM range. Try widening the range, adding
            more sources, or turning on double and half speed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onBack} className={GHOST_BUTTON}>
          <span className="flex items-center gap-2">
            <ArrowLeft size={16} aria-hidden="true" /> Back to the builder
          </span>
        </button>
        <p className="text-xs text-gray-500">
          {result.scannedCount.toLocaleString()} songs scanned across{' '}
          {result.sourceCount} source{result.sourceCount === 1 ? '' : 's'}
        </p>
      </div>

      <header>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {matchCount.toLocaleString()} song{matchCount === 1 ? '' : 's'} at your
          tempo
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          Pick the ones you want, then save them as a new playlist.
        </p>
      </header>

      <div className={`${CARD} flex flex-wrap items-center gap-x-6 gap-y-4 p-4`}>
        <div>
          <p className={`${SECTION_LABEL} mb-2`}>Group by</p>
          <div className="flex flex-wrap gap-1 rounded-full border border-white/10 bg-paper-600/60 p-1">
            {GROUP_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={groupBy === option}
                onClick={() => setGroupBy(option)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 sm:text-sm ${
                  groupBy === option
                    ? 'bg-primary text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {GROUP_BY_LABELS[option]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className={`${SECTION_LABEL} mb-2`}>Order</p>
          <select
            aria-label="Sort groups"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="rounded-full border border-white/10 bg-paper-600/60 px-3.5 py-2 text-xs font-semibold text-gray-200 transition focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/30 sm:text-sm"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-paper-700">
                {SORT_BY_LABELS[option]}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto flex items-end gap-2 self-end">
          <button
            type="button"
            onClick={() => selectSongs(result.tracks)}
            className={GHOST_BUTTON}
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => clearSongs(result.tracks)}
            className={GHOST_BUTTON}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <ResultGroup key={group.id} group={group} />
        ))}
      </div>

      {/* The save bar follows you down the list - with a few hundred matches,
          a save button at the very bottom is a long scroll away. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-background/90 backdrop-blur">
        <div className="mx-auto w-full max-w-5xl px-4 py-2.5 sm:px-6 sm:py-3">
          <p className="mb-1.5 text-[11px] font-semibold text-gray-500">
            {selectedSongs.length.toLocaleString()} of{' '}
            {matchCount.toLocaleString()} selected
          </p>
          <div className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <TextInput
                label="playlist-name"
                value={playlistName}
                placeholder="New playlist name"
                onChange={(e) => setPlaylistName(e.target.value)}
                className="!py-2.5 text-sm"
              />
            </div>
            <SaveSongsButton
              onClick={onSave}
              disabled={selectedSongs.length === 0 || !playlistName || saving}
              saving={saving}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultsView;
