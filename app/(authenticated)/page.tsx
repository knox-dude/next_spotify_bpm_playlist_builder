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
    <section className="flex flex-col items-start">
      <h1 className="mb-2 text-4xl font-bold text-center self-center">
        BPM Playlist Builder
      </h1>
      <BpmFormHolder session={session} />
    </section>
  );
}
