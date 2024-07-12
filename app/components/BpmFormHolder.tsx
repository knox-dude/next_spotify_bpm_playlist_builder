"use client";
import React, { useState, useEffect } from "react";
import { SelectedPlaylistsProvider } from "../providers/SelectedPlaylistsProvider";
import BpmSubmitForm from "./BpmSubmitForm";
import { AuthSession, Playlist, TrackWithAnalysis } from "../types/types";
import generateBpmSongs from "../lib/generateBpmSongs";

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

interface BpmFormHolderProps {
  session: AuthSession;
}

function BpmFormHolder({ session }: BpmFormHolderProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<Map<Playlist, TrackWithAnalysis[]>>(
    new Map<Playlist, TrackWithAnalysis[]>()
  );
  const [completedResults, setCompletedResults] = useState<boolean>(false);
  const [generationParams, setGenerationParams] =
    useState<HandleBpmGenerationProps | null>(null);

  useEffect(() => {
    if (generationParams) {
      setLoading(true);
      generateBpmSongs(
        parseInt(generationParams.lowBpm),
        parseInt(generationParams.highBpm),
        generationParams.doubleSpeed,
        generationParams.halfSpeed,
        generationParams.shortTerm,
        generationParams.mediumTerm,
        generationParams.longTerm,
        session,
        generationParams.selectedPlaylists // Add selected playlists
      )
        .then((results) => {
          setResults(results);
          setCompletedResults(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error(`problem getting bpm songs: ${err}`);
          setLoading(false);
        });
    }
  }, [generationParams, session]);

  const handleBpmGeneration = (params: HandleBpmGenerationProps) => {
    setGenerationParams(params);
  };

  return (
    <SelectedPlaylistsProvider>
      {!loading && !completedResults && (
        <BpmSubmitForm
          session={session}
          handleBpmGeneration={handleBpmGeneration}
        />
      )}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="loader">Loading...</div>
        </div>
      )}
      {!loading && completedResults && (
        <div>
          {Array.from(results.entries()).map(([playlist, tracks]) => (
            <div key={playlist.id}>
              <h2>{playlist.name}</h2>
              {tracks.map((track) => (
                <div key={track.id}>
                  <h3>{track.name}</h3>
                  <p>
                    Artist:{" "}
                    {track.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <p>Album: {track.album.name}</p>
                  <p>BPM: {track.analysis.tempo}</p>
                </div>
              ))}
            </div>
          ))}
        <button
          onClick={() => setCompletedResults(false)}
          className="bg-paper-500 mb-4 text-white rounded-md p-2 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-paper-600"
        >
          Back to Playlist Builder
        </button>
        </div>
      )}
    </SelectedPlaylistsProvider>
  );
}

export default BpmFormHolder;
