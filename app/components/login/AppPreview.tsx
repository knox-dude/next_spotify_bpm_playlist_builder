import React from 'react';

/**
 * A decorative mock of the app's main screen, shown behind the login card so
 * visitors can see what they're signing into.
 *
 * This is deliberately a hand-built mock rather than a screenshot: a real one
 * would need a logged-in Spotify session to capture, would go stale as the UI
 * changes, and couldn't reflow for mobile. Everything here is fake data and
 * hidden from assistive tech.
 */

/** Fake playlist tiles - the gradients stand in for album art. */
const MOCK_PLAYLISTS = [
  { name: 'Liked Songs', from: 'from-indigo-500', to: 'to-purple-700' },
  { name: 'Morning Run', from: 'from-emerald-400', to: 'to-teal-700' },
  { name: 'Gym Bangers', from: 'from-orange-400', to: 'to-red-600' },
  { name: 'Road Trip', from: 'from-sky-400', to: 'to-blue-700' },
  { name: 'Focus', from: 'from-slate-400', to: 'to-slate-700' },
  { name: 'Throwbacks', from: 'from-pink-400', to: 'to-rose-700' },
];

/** Fake results, with tempos inside the mocked 120-140 range. */
const MOCK_RESULTS = [
  { title: 'Blinding Lights', artist: 'The Weeknd', bpm: 171 },
  { title: 'Levitating', artist: 'Dua Lipa', bpm: 103 },
  { title: 'Rasputin', artist: 'Majestic', bpm: 128 },
  { title: 'Misery Business', artist: 'Paramore', bpm: 173 },
  { title: 'Golden Brown', artist: 'The Stranglers', bpm: 187 },
];

const AppPreview: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none select-none w-full max-w-5xl rounded-2xl border border-white/10 bg-paper-700/90 p-4 shadow-2xl sm:p-6"
  >
    {/* Faux window chrome */}
    <div className="mb-4 flex items-center gap-2">
      <span className="h-3 w-3 rounded-full bg-red-500/70" />
      <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
      <span className="h-3 w-3 rounded-full bg-green-500/70" />
      <p className="ml-3 truncate text-xs text-gray-400">
        BPM Playlist Builder
      </p>
    </div>

    {/* BPM range inputs */}
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
          Lower BPM
        </p>
        <div className="rounded-md border border-white/10 bg-paper-600 px-3 py-2 text-sm font-semibold text-white">
          120
        </div>
      </div>
      <div className="flex-1">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-gray-500">
          Upper BPM
        </p>
        <div className="rounded-md border border-white/10 bg-paper-600 px-3 py-2 text-sm font-semibold text-white">
          140
        </div>
      </div>
      <div className="rounded-md bg-primary px-4 py-2 text-center text-sm font-bold text-black">
        Generate
      </div>
    </div>

    {/* Playlist picker */}
    <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">
      Your playlists
    </p>
    <div className="mb-5 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
      {MOCK_PLAYLISTS.map((playlist, index) => (
        <div key={playlist.name} className="relative">
          <div
            className={`aspect-square rounded-md bg-gradient-to-br ${playlist.from} ${playlist.to}`}
          />
          {/* Mark the first two as selected, mirroring the real picker. */}
          {index < 2 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-black">
              ✓
            </span>
          )}
          <p className="mt-1 truncate text-[10px] text-gray-400">
            {playlist.name}
          </p>
        </div>
      ))}
    </div>

    {/* Results */}
    <p className="mb-2 text-[10px] uppercase tracking-wider text-gray-500">
      Matches
    </p>
    <ul className="space-y-1.5">
      {MOCK_RESULTS.map((track) => (
        <li
          key={track.title}
          className="flex items-center gap-3 rounded-md bg-paper-600/70 px-3 py-2"
        >
          <span className="h-7 w-7 shrink-0 rounded bg-gradient-to-br from-paper-400 to-paper-600" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-white">
              {track.title}
            </span>
            <span className="block truncate text-[10px] text-gray-500">
              {track.artist}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
            {track.bpm} BPM
          </span>
        </li>
      ))}
    </ul>
  </div>
);

export default AppPreview;
