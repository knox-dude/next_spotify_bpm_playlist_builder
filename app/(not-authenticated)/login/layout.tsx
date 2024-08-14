// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import '@/app/globals.css';
import { NextAuthProvider } from '@/app/providers/NextAuthProvider';
import { Montserrat } from 'next/font/google';

const fontFamily = Montserrat({ subsets: ['latin'] });

export const metadata = {
  title: 'Login with Spotify',
  description: 'Login page to authenticate through Spotify',
};

export default function LoginPageLayout({
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
          content="https://spotify-bpm-playlist-builder.vercel.app/images/spotify_logo_linkedin_og.png"
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
          content="https://spotify-bpm-playlist-builder.vercel.app/images/spotify_logo_linkedin_og.png"
        />
      </head>
      <NextAuthProvider>
        <body className={fontFamily.className + ' text-white bg-paper-700'}>
          <main>{children}</main>
        </body>
      </NextAuthProvider>
    </html>
  );
}
