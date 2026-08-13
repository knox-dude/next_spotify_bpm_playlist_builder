'use client';

import { signOut } from 'next-auth/react';

/**
 * The bar across the top of the signed-in app: what this is, and the way out.
 *
 * The pulsing dot is the same 128 BPM beat the login screen uses - it's the one
 * bit of chrome that says what the app does without words.
 */
function AppHeader() {
  const handleSignOut = () => {
    try {
      // Clear session cookies for full logout - redirect to login page afterwards
      signOut({ callbackUrl: '/login' });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-bpm absolute inline-flex h-full w-full rounded-full bg-primary" />
          </span>
          <span className="truncate text-sm font-bold tracking-tight sm:text-base">
            BPM Playlist Builder
          </span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="shrink-0 rounded-full border border-white/10 px-4 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-white/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:text-sm"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}

export default AppHeader;
