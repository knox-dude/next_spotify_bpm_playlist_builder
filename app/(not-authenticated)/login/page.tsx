// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

'use client';

import { signIn } from 'next-auth/react';
import Image from 'next/image';
import AppPreview from '@/app/components/login/AppPreview';

const STEPS = [
  {
    title: 'Pick your sources',
    body: 'Any playlist you own or follow, your Liked Songs, or your top tracks.',
  },
  {
    title: 'Choose a BPM range',
    body: 'Match your stride. Optionally include songs at double or half tempo.',
  },
  {
    title: 'Save the playlist',
    body: 'Every match lands in a new Spotify playlist, ready to play.',
  },
];

export default function Login() {
  const handleLogin = () => {
    signIn('spotify', { callbackUrl: '/' });
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-background">
      {/* Layer 1: a mock of the app itself, sitting behind the login card. */}
      <div className="absolute inset-0 flex items-start justify-center overflow-hidden px-4 pt-24 sm:items-center sm:pt-0">
        <div className="w-full scale-[1.15] opacity-70 blur-[2px] sm:scale-100 sm:opacity-90 sm:blur-[1px]">
          <div className="mx-auto flex justify-center">
            <AppPreview />
          </div>
        </div>
      </div>

      {/* Layer 2: scrim, so the card always has contrast to sit on. Kept light
          enough that the preview behind it stays legible. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/85" />

      {/* Layer 3: the login pane. */}
      <main className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-10 px-4 py-12 sm:px-6">
        <section className="w-full max-w-md rounded-2xl border border-white/10 bg-paper-700/80 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/spotify_logo.png"
              alt="Spotify"
              width={320}
              height={96}
              className="h-auto w-40 sm:w-52"
              priority
            />

            <h1 className="mb-0 mt-6 text-2xl font-bold leading-tight sm:text-3xl">
              BPM Playlist Builder
            </h1>

            <p className="mt-3 text-sm text-gray-400 sm:text-base">
              Search every playlist you have for songs at the tempo you want,
              then turn them into a playlist.
            </p>

            {/* The dot beats at 128 BPM. */}
            <div className="mt-6 flex items-center gap-3 rounded-full border border-white/10 bg-paper-600/60 px-4 py-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-bpm absolute inline-flex h-full w-full rounded-full bg-primary" />
              </span>
              <span className="text-xs font-semibold tracking-widest text-gray-300">
                128 BPM
              </span>
            </div>

            <button
              className="mt-8 w-full rounded-full bg-primary px-8 py-3.5 text-base font-bold uppercase tracking-widest text-black transition hover:bg-opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper-700"
              onClick={handleLogin}
            >
              Log in with Spotify
            </button>

            <p className="mt-4 text-xs text-gray-500">
              Read-only access to your library, plus permission to create the
              playlist you build.
            </p>
          </div>

          {/* Spotify apps in development mode only admit allow-listed accounts,
              so a shared demo login is the only way for a visitor to try it. */}
          <details className="mt-6 border-t border-white/10 pt-4 text-center">
            <summary className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-white">
              No access? Use the demo account
            </summary>
            <div className="mt-3 space-y-1 text-xs">
              <p className="text-gray-500">
                Enter these at the Spotify login prompt:
              </p>
              <p className="break-all font-mono text-gray-300">
                spotifybpmtest@gmail.com
              </p>
              <p className="break-all font-mono text-gray-300">
                TestingPassword!NotSafe!
              </p>
            </div>
          </details>
        </section>

        {/* How it works - keeps the fold useful on a phone, where the preview
            behind the card is mostly obscured. */}
        <section className="grid w-full max-w-4xl gap-3 sm:grid-cols-3 sm:gap-4">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="rounded-xl border border-white/10 bg-paper-700/60 p-4 backdrop-blur-sm"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-black text-black">
                {index + 1}
              </span>
              <h2 className="mt-3 text-sm font-bold text-white">
                {step.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">
                {step.body}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
