import { AuthSession, Track, TrackAnalysis } from "../types/types";
import { getManyTrackAnalysis } from "./actions";

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

async function generateBpmSongs(lowBpm: number, highBpm: number, songs: Track[], session: AuthSession): Promise<Track[]> {
  const chunkedSongs = chunkArray(songs, 100);
  const results: any[] = [];

  for (const chunk of chunkedSongs) {
    const features = await getManyTrackAnalysis(session, chunk.map(song => song.id));
    results.push(...features);
  }

  // Filter songs based on BPM or any other logic
  const filteredSongs: Track[] = results.filter(song => {
    return song.tempo >= lowBpm && song.tempo <= highBpm;
  });

  return filteredSongs;
}

export default generateBpmSongs;