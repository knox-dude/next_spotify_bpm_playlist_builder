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
        <meta
          property="og:image"
          content="https://kreafolk.com/cdn/shop/articles/spotify-logo-design-history-and-evolution-kreafolk_b995ad53-7473-4492-9710-58b9e5c32ecd.jpg?v=1717725016&width=2048"
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
        <meta
          name="twitter:image"
          content="https://kreafolk.com/cdn/shop/articles/spotify-logo-design-history-and-evolution-kreafolk_b995ad53-7473-4492-9710-58b9e5c32ecd.jpg?v=1717725016&width=2048"
        />
      </head>
      <NextAuthProvider>
        {/* min-h rather than a locked h-screen: on mobile the toolbar makes
            100vh taller than the visible area, which used to clip the page. */}
        <body
          className={
            fontFamily.className +
            ' min-h-[100dvh] bg-background text-white antialiased'
          }
        >
          {/* A single green wash behind the page, echoing the login screen, so
              the app doesn't read as a flat black form. */}
          <div className="pointer-events-none fixed inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(30,215,96,0.12),transparent_70%)]" />
          <div className="relative flex min-h-[100dvh] flex-col">{children}</div>
        </body>
      </NextAuthProvider>
    </html>
  );
}
