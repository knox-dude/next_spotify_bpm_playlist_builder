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
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <title>Spotify BPM Playlist Builder - Login</title>
        <meta
          property="og:title"
          content="Spotify BPM Playlist Builder - Login"
        />
        <meta
          property="og:description"
          content="BPM Playlist Builder for Spotify Users"
        />
        <meta property="og:image" content="/images/spotify_logo.png" />
        <meta
          property="og:url"
          content="https://spotify-bpm-playlist-builder.vercel.app/login"
        />
        <meta property="og:type" content="website" />
      </head>
      <NextAuthProvider>
        <body className={fontFamily.className + ' text-white bg-paper-700'}>
          <main>{children}</main>
        </body>
      </NextAuthProvider>
    </html>
  );
}
