import { AuthSession, Track, TrackAnalysis } from "../types/types";
import { getManyTrackAnalysis, getTrackFromPlaylistLink } from "./actions";
import { getAllUserLikedPlaylists } from "./actions";
import { Playlist } from "../types/types";

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

async function generateBpmSongs(lowBpm: number, highBpm: number, session: AuthSession): Promise<Track[]> {
  // get all users playlists
  const userPlaylists = (await getAllUserLikedPlaylists(session).then(
    (data) => data.sort((a, b) => a.name.localeCompare(b.name))
  )) as Playlist[];

  const songs = [];

  // get all songs from the playlists
  for (const playlist of userPlaylists.slice(3, 6)) {
    const playlistTracks = await getTrackFromPlaylistLink(session, playlist.tracks.href)
    songs.push(...playlistTracks.map(item => item.track));
  }

  const chunkedSongs = chunkArray(songs, 100);
  const results: any[] = [];

  for (const chunk of chunkedSongs) {
    const features = await getManyTrackAnalysis(session, chunk.map(song => song.id));
    console.log(features);
    results.push(...features.filter(song => song.tempo !== null && song.tempo >= lowBpm && song.tempo <= highBpm));
  }

  return results.map(song => song.id);
}

export default generateBpmSongs;