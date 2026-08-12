// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import { redirect } from 'next/navigation';
import { getAuthSession } from '../utils/serverUtils';
import BpmFormHolder from '../components/BpmFormHolder';

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <section className="flex flex-col items-stretch">
      <h1 className="mb-2 self-center text-center text-2xl font-bold sm:text-4xl">
        BPM Playlist Builder
      </h1>
      <BpmFormHolder session={session} />
    </section>
  );
}
