import { useState } from 'react';
import { AuthSession } from '../types/types';
import { Playlist } from '../types/updatedTypes';
import {
  ScanProgress,
  ScanResult,
  generateBpmSongs,
} from '../lib/generateBpmSongs';

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

const EMPTY_RESULT: ScanResult = {
  tracks: [],
  scannedCount: 0,
  sourceCount: 0,
};

const useGenerateBpmSongs = (session: AuthSession) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult>(EMPTY_RESULT);
  const [progress, setProgress] = useState<ScanProgress | null>(null);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSongs = async (params: HandleBpmGenerationProps) => {
    setLoading(true);
    setError(null);
    setProgress(null);
    try {
      const scan = await generateBpmSongs({
        session,
        lowBpm: parseInt(params.lowBpm),
        highBpm: parseInt(params.highBpm),
        useDoubleSpeed: params.doubleSpeed,
        useHalfSpeed: params.halfSpeed,
        useTopShortTerm: params.shortTerm,
        useTopMediumTerm: params.mediumTerm,
        useTopLongTerm: params.longTerm,
        playlists: params.selectedPlaylists,
        onProgress: setProgress,
      });
      setResult(scan);
      setCompleted(true);
    } catch (err) {
      setError(`problem getting bpm songs: ${err}`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return {
    generateSongs,
    loading,
    progress,
    result,
    completed,
    error,
    setCompleted,
  };
};

export default useGenerateBpmSongs;
