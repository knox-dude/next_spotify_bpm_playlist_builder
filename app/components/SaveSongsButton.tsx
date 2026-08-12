import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import { TrackWithAudioFeature } from '../types/updatedTypes';

function SaveSongsButton({
  onClick,
}: {
  onClick: (songs: TrackWithAudioFeature[], newWindow: Window | null) => void;
}) {
  const { selectedSongs } = useSelectedSongs();

  return (
    <button
      type="button"
      onClick={() => {
        const newWindow = window.open('', '_blank');
        onClick(selectedSongs, newWindow);
      }}
      className="mb-4 w-full self-center rounded-md bg-paper-500 p-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:bg-paper-600 sm:w-1/3 sm:text-base"
    >
      Save Songs to Playlist
    </button>
  );
}

export default SaveSongsButton;
