"use client";

import { AuthSession } from "../types/types";
import generateBpmSongs from "../lib/generateBpmSongs";



export default function GenerateBpmButton({session}: {session: AuthSession}) {

  return (
    <button className="bg-paper-500 text-white rounded-md p-2 hover:bg-paper-600" onClick={() => generateBpmSongs(100, 120, session)}>
      Generate BPM
    </button>
  );
}