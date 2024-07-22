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
        <link rel="shortcut icon" href="/images/favicon.ico" />
      </head>
      <NextAuthProvider>
        <body
          className={
            fontFamily.className +
            ' h-screen flex flex-col overflow-hidden bg-background text-white items-stretch p-2'
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
