import { Track } from "../types/types";
import { Album } from "lucide-react";
import Image from "next/image";

function TrackDisplay({track}: {track: Track}) {

  return (
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
  );
}
