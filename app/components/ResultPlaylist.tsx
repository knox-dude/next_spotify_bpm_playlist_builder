import { Playlist, TrackWithAnalysis } from "../types/types";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Album } from "lucide-react";
import { MdExpandLess } from "react-icons/md";
import { MdExpandMore } from "react-icons/md";

interface ResultPlaylistProps {
  playlist: Playlist;
  tracks: TrackWithAnalysis[];
}

function ResultPlaylist({ playlist, tracks }: ResultPlaylistProps) {
  const [expanded, setExpanded] = useState<boolean>(false);

  return (
    <div className="flex flex-col w-full mb-4">
      <div className="flex w-full cursor-pointer bg-paper-500 p-2 rounded-md justify-between" onClick={() => setExpanded((prev) => !prev)}>
        <Image
          src={playlist.images[0].url}
          alt={playlist.name}
          width={72}
          height={72}
          className="object-cover h-full rounded-tl-md rounded-bl-md aspect-square"
        />
        <h2 className="font-bold text-lg self-center">{playlist.name}</h2>
        {expanded ? <MdExpandLess className='self-center' style={{width:50, height:50}}/> : <MdExpandMore className='self-center' style={{width:50, height:50}}/>}
      </div>
      {expanded && (
        <div className="mt-2">
          {tracks.map((track) => (
            <Link
              href={`/tracks/${track.id}`}
              key={track.id}
              className="flex items-center justify-between mb-2 pr-4 truncate rounded-md group/item bg-paper-600 hover:bg-paper-500"
            >
              <div className="flex items-center gap-4 w-full">
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
                <h3 className="font-semibold truncate w-full">{track.name}</h3>
                <h3 className="font-semibold truncate w-full">BPM: {track.analysis.tempo}</h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResultPlaylist;
