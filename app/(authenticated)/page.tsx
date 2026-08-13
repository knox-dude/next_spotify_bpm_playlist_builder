// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import { redirect } from 'next/navigation';
import { getAuthSession } from '../utils/serverUtils';
import AppHeader from '../components/AppHeader';
import BpmFormHolder from '../components/BpmFormHolder';

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <BpmFormHolder session={session} />
      </main>
    </>
  );
}
