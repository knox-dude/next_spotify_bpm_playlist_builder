import {
  AuthSession,
  Track,
  TrackAnalysis,
  Playlist,
  TrackWithAnalysis,
} from "../types/types";
import {
  getManyTrackAnalysis,
  getTrackFromPlaylistLink,
  getTopItems,
} from "./actions";
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
async function keepSongsInCorrectBpmRange(
  lowBpm: number,
  highBpm: number,
  chunkedSongs: Track[][],
  session: AuthSession,
  getDoubled = false,
  getHalved = false
): Promise<TrackWithAnalysis[]> {
  const results: TrackWithAnalysis[] = [];

  // extract features
  for (const chunk of chunkedSongs) {
    const features = await getManyTrackAnalysis(
      session,
      chunk.map((song) => song.id)
    );

    try {
      // check if the song is in the desired BPM range, accounting for double/half speed
      const filteredFeatures = features.filter(
        (song) =>
          song &&
          song.tempo &&
          ((getDoubled &&
            song.tempo &&
            song.tempo >= lowBpm * 2 &&
            song.tempo <= highBpm * 2) ||
            (getHalved &&
              song.tempo &&
              song.tempo >= lowBpm / 2 &&
              song.tempo <= highBpm / 2) ||
            (song.tempo && song.tempo >= lowBpm && song.tempo <= highBpm))
      );
      // match the analysis with the original track, for later display
      filteredFeatures.forEach((analysis) => {
        const track = chunk.find((song) => song.id === analysis.id);
        if (track) {
          results.push({
            ...track,
            analysis,
          });
        }
      });
    } catch (e) {
      // TODO: testing. I think this error is gone. I can't be 100% sure until testing.
      console.debug(e);
    }
  }

  return results;
}

// TODO: implement the top tracks
// TODO: make set so that no duplicate songs are taken (do it upon getting the songs from the playlists)
async function generateBpmSongs(
  lowBpm: number,
  highBpm: number,
  useDoubleSpeed: boolean,
  useHalfSpeed: boolean,
  useTopShortTerm: boolean,
  useTopMediumTerm: boolean,
  useTopLongTerm: boolean,
  session: AuthSession,
  playlists?: Playlist[]
): Promise<Map<Playlist, TrackWithAnalysis[]>> {
  // const playlistTracks = [];
  const playlistTracks = new Map<Playlist, TrackWithAnalysis[]>();
  const results = [];

  if (!playlists) {
    if (!useTopShortTerm && !useTopMediumTerm && !useTopLongTerm) {
      throw new Error("No playlists or top tracks selected");
    }
  }

  // get all songs from the playlists
  for (const playlist of playlists as Playlist[]) {
    const tracks = await getTrackFromPlaylistLink(
      session,
      playlist.tracks.href
    );
    const chunkedSongs = chunkArray(
      tracks.map((item) => item.track),
      100
    );
    const filteredTracks = await keepSongsInCorrectBpmRange(
      lowBpm,
      highBpm,
      chunkedSongs,
      session,
      useDoubleSpeed,
      useHalfSpeed
    );
    playlistTracks.set(playlist, filteredTracks);
  }

  // need to test this in debugger to see if it works.
  if (useTopShortTerm) {
    const topShortTerm = await getTopItems({
      session,
      timeRange: "short_term",
      type: "tracks",
      limit: 50,
    });
    console.log(topShortTerm);
  }

  return playlistTracks;
}

export default generateBpmSongs;
