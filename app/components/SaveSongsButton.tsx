import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import { TrackWithAudioFeature } from '../types/updatedTypes';

function SaveSongsButton({
  onClick,
}: {
  onClick: (songs: TrackWithAudioFeature[]) => void;
}) {
  const { selectedSongs } = useSelectedSongs();

  return (
    <button
      type="button"
      onClick={() => onClick(selectedSongs)}
      className=" w-1/3 self-center bg-paper-500 mb-4 text-white rounded-md p-2 disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-paper-600"
    >
      Save Songs to Playlist
    </button>
  );
}

export default SaveSongsButton;
