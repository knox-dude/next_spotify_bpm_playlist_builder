import { useSelectedSongs } from '../providers/SelectedSongsProvider';
import { TrackWithAudioFeature } from '../types/updatedTypes';
import { PRIMARY_BUTTON } from './ui/styles';

interface SaveSongsButtonProps {
  onClick: (
    songs: TrackWithAudioFeature[],
    newWindow: Window | null,
  ) => void | Promise<void>;
  disabled?: boolean;
  saving?: boolean;
}

function SaveSongsButton({ onClick, disabled, saving }: SaveSongsButtonProps) {
  const { selectedSongs } = useSelectedSongs();

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        // Opened synchronously off the click, or the browser treats the later
        // redirect to Spotify as a popup and blocks it.
        const newWindow = window.open('', '_blank');
        onClick(selectedSongs, newWindow);
      }}
      className={`${PRIMARY_BUTTON} !px-6 !py-2.5 !text-xs sm:!text-sm`}
    >
      {saving ? 'Saving...' : 'Save to Spotify'}
    </button>
  );
}

export default SaveSongsButton;
