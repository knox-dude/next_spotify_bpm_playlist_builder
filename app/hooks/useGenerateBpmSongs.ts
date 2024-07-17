import { useState, useEffect } from 'react';
import { Playlist, TrackWithAnalysis, AuthSession } from '../types/types';
import generateBpmSongs from '../lib/generateBpmSongs';

interface HandleBpmGenerationProps {
  lowBpm: string;
  highBpm: string;
  doubleSpeed: boolean;
  halfSpeed: boolean;
  shortTerm: boolean;
  mediumTerm: boolean;
  longTerm: boolean;
  selectedPlaylists: Playlist[];
}

const useGenerateBpmSongs = (session: AuthSession) => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Map<Playlist, TrackWithAnalysis[]>>(new Map());
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSongs = async (params: HandleBpmGenerationProps) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateBpmSongs(
        parseInt(params.lowBpm),
        parseInt(params.highBpm),
        params.doubleSpeed,
        params.halfSpeed,
        params.shortTerm,
        params.mediumTerm,
        params.longTerm,
        session,
        params.selectedPlaylists
      );
      setResults(result);
      setCompleted(true);
    } catch (err) {
      setError(`problem getting bpm songs: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return { generateSongs, loading, results, completed, error, setCompleted };
};

export default useGenerateBpmSongs;
