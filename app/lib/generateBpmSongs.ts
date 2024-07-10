import { AuthSession, Track, TrackAnalysis, Playlist } from "../types/types";
import { getManyTrackAnalysis, getTrackFromPlaylistLink } from "./actions";
import { getAllUserLikedPlaylists } from "./actions";

// splits arrays (of tracks) into chunks - spotify can only evaluate 100 tracks per API call
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

// only keep songs in desired BPM range
// TODO: include checkbox for half-speed and double-speed
async function keepSongsInCorrectBpmRange(
  lowBpm: number,
  highBpm: number,
  chunkedSongs: Track[][],
  session: AuthSession,
  getDoubled=false,
  getHalved=false
): Promise<string[]> {
  const results: TrackAnalysis[] = [];
  // extract features
  for (const chunk of chunkedSongs) {
    const features = await getManyTrackAnalysis(
      session,
      chunk.map((song) => song.id)
    );

    if (getDoubled) {
      results.push(
        ...features.filter(
          song => song.tempo && song.tempo >= (lowBpm*2) && song.tempo <= (highBpm*2)
        )
      )
    }

    if (getHalved) {
      results.push(
        ...features.filter(
          song => song.tempo && song.tempo >= (lowBpm/2) && song.tempo <= (highBpm/2)
        )
      )
    }

    results.push(
      ...features.filter(
        song => song.tempo && song.tempo >= lowBpm && song.tempo <= highBpm
      )
    );
  }

  return results.map((song) => song.id);
}

async function generateBpmSongs(
  lowBpm: number,
  highBpm: number,
  session: AuthSession
): Promise<string[]> {
  // get all users playlists - REPLACE THIS WITH USERS CHOICE OF PLAYLISTS
  const userPlaylists = (await getAllUserLikedPlaylists(session).then((data) =>
    data.sort((a, b) => a.name.localeCompare(b.name))
  )) as Playlist[];

  const songs = [];

  // get all songs from the (TODO: checked) playlists
  for (const playlist of userPlaylists.slice(3, 6)) {
    const playlistTracks = await getTrackFromPlaylistLink(
      session,
      playlist.tracks.href
    );
    songs.push(...playlistTracks.map((item) => item.track));
  }

  // chunk songs into evaluatable amounts
  const chunkedSongs = chunkArray(songs, 100);
  const results: string[] = await keepSongsInCorrectBpmRange(lowBpm, highBpm, chunkedSongs, session);

  return results;
}

export default generateBpmSongs;
