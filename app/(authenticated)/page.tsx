// Disclaimer: Code partially taken from Next-Spotify-V2 (https://github.com/ankitk26/Next-Spotify-v2)

import { redirect } from "next/navigation";
import { getAuthSession } from "../utils/serverUtils";
import { getAllUserLikedPlaylists, getTopItems, getUserLikedPlaylists } from "../lib/actions";
import { Track, Playlist } from "../types/types";
import Link from "next/link";
import Image from "next/image";
import { Album } from "lucide-react";
import BpmSubmitForm from "../components/BpmSubmitForm";
import BpmFormHolder from "../components/BpmFormHolder";

export default async function Home() {
  const session = await getAuthSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <section className="flex flex-col items-start">
      <h1 className="mb-2 text-4xl font-bold text-center self-center">BPM Playlist Builder</h1>
      <BpmFormHolder session={session}/>
    </section>
  );
}


/**
 * Previously was here: Top Tracks ( use this for future displays )
 * 
 * const topTracks = (await getTopItems({
    session,
    limit: 9,
    type: "tracks",
  }).then((data) => data.items)) as Track[];
 * 
 * 
 *    <h1 className="mt-8">Top Tracks</h1>
      <div className="grid w-full grid-cols-12 gap-4">
        {topTracks.map((track) => (
          <Link
            href={`/tracks/${track.id}`}
            key={track.id}
            className="flex items-center justify-between col-span-4 pr-4 truncate rounded-md group/item bg-paper-600 hover:bg-paper-400"
          >
            <div className="flex items-center gap-4">
              {track.album.images.length > 0 ? (
                <Image
                  src={track.album.images[0].url}
                  alt={track.name}
                  width={72}
                  height={72}
                  className="object-cover h-full rounded-tl-md rounded-bl-md aspect-square"
                />
              ) : (
                <Album size={20} />
              )}
              <h3 className="font-semibold truncate">{track.name}</h3>
            </div>
          </Link>
        ))}
      </div>
 */