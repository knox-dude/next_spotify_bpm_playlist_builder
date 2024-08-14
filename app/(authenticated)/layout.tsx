// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import '@/app/globals.css';
import { NextAuthProvider } from '@/app/providers/NextAuthProvider';
import { Montserrat } from 'next/font/google';

const fontFamily = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'Spotify BPM Playlist Builder',
  description: 'An app that lets you create Spotify playlists based on BPM',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* <!-- HTML Meta Tags --> */}
        <title>Spotify BPM Playlist Builder</title>
        <meta
          name="description"
          content="BPM Playlist Builder for Spotify users, built with NextJS, React, and Typescript"
        />
        <link rel="shortcut icon" href="/images/favicon.ico" />

        {/* <!-- Facebook Meta Tags --> */}
        <meta
          property="og:url"
          content="https://spotify-bpm-playlist-builder.vercel.app"
        />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Spotify BPM Playlist Builder" />
        <meta
          property="og:description"
          content="BPM Playlist Builder for Spotify users, built with NextJS, React, and Typescript"
        />
        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:domain"
          content="spotify-bpm-playlist-builder.vercel.app"
        />
        <meta
          property="twitter:url"
          content="https://spotify-bpm-playlist-builder.vercel.app"
        />
        <meta name="twitter:title" content="Spotify BPM Playlist Builder" />
        <meta
          name="twitter:description"
          content="BPM Playlist Builder for Spotify users, built with NextJS, React, and Typescript"
        />
      </head>
      <NextAuthProvider>
        <body
          className={
            fontFamily.className +
            ' h-screen flex flex-col overflow-hidden bg-background text-white items-stretch p-2 pb-12'
          }
        >
          <div className="flex flex-col col-span-8 overflow-auto rounded-lg bg-paper-400">
            <main className="mx-8 my-4">{children}</main>
          </div>
        </body>
      </NextAuthProvider>
    </html>
  );
}
