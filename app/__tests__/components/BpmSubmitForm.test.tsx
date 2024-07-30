import React from 'react';
import { act, render, screen, fireEvent } from '@testing-library/react';
import BpmSubmitForm from '../../components/BpmSubmitForm';
import { useSelectedPlaylists } from '../../providers/SelectedPlaylistsProvider';
import { AuthSession } from '../../types/types';
import fetch from 'jest-fetch-mock';

// mock fetch
fetch.mockResponse(
  JSON.stringify({
    href: 'https://api.spotify.com/v1/users/andrew.knox.schwartz/playlists?offset=0&limit=50&locale=*',
    limit: 50,
    next: null,
    offset: 0,
    previous: null,
    total: 1,
    items: [
      {
        collaborative: false,
        description: '',
        external_urls: {
          spotify: 'https://open.spotify.com/playlist/1l59Zc8YNe94wFj17V0vmI',
        },
        href: 'https://api.spotify.com/v1/playlists/1l59Zc8YNe94wFj17V0vmI',
        id: '1l59Zc8YNe94wFj17V0vmI',
        images: [
          {
            height: 640,
            url: 'https://mosaic.scdn.co/640/ab67616d00001e0226d64b6150aa3d9b6b67d857ab67616d00001e023bc8b33b9d1f2c7a34d7ac66ab67616d00001e0248f0ef1553b8f36d4f262e5dab67616d00001e02676b6702843066ae6bff73e6',
            width: 640,
          },
          {
            height: 300,
            url: 'https://mosaic.scdn.co/300/ab67616d00001e0226d64b6150aa3d9b6b67d857ab67616d00001e023bc8b33b9d1f2c7a34d7ac66ab67616d00001e0248f0ef1553b8f36d4f262e5dab67616d00001e02676b6702843066ae6bff73e6',
            width: 300,
          },
          {
            height: 60,
            url: 'https://mosaic.scdn.co/60/ab67616d00001e0226d64b6150aa3d9b6b67d857ab67616d00001e023bc8b33b9d1f2c7a34d7ac66ab67616d00001e0248f0ef1553b8f36d4f262e5dab67616d00001e02676b6702843066ae6bff73e6',
            width: 60,
          },
        ],
        name: 'Running V2',
        owner: {
          display_name: 'Andrew',
          external_urls: {
            spotify: 'https://open.spotify.com/user/andrew.knox.schwartz',
          },
          href: 'https://api.spotify.com/v1/users/andrew.knox.schwartz',
          id: 'andrew.knox.schwartz',
          type: 'user',
          uri: 'spotify:user:andrew.knox.schwartz',
        },
        primary_color: null,
        public: true,
        snapshot_id: 'AAAACVtpAng7yeqdArANJqm3pkFSaq8p',
        tracks: {
          href: 'https://api.spotify.com/v1/playlists/1l59Zc8YNe94wFj17V0vmI/tracks',
          total: 89,
        },
        type: 'playlist',
        uri: 'spotify:playlist:1l59Zc8YNe94wFj17V0vmI',
      },
    ],
  }),
);

// Mock the useSelectedPlaylists hook
jest.mock('../../providers/SelectedPlaylistsProvider', () => ({
  useSelectedPlaylists: jest.fn(),
}));

const mockUseSelectedPlaylists = useSelectedPlaylists as jest.Mock;

const mockSession: AuthSession = {
  user: {
    sub: '123',
    accessToken: 'mockAccessToken',
  },
} as AuthSession;

const mockHandleBpmGeneration = jest.fn();

describe('BpmSubmitForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelectedPlaylists.mockReturnValue({ selectedPlaylists: [] });
  });

  test('renders the component with initial state', async () => {
    await act(async () => {
      render(
        <BpmSubmitForm
          session={mockSession}
          handleBpmGeneration={mockHandleBpmGeneration}
        />,
      );
    });

    expect(screen.getByText('Choose BPM range')).toBeInTheDocument();
    expect(screen.getByText('Choose options')).toBeInTheDocument();
  });

  test('handles BPM input changes', async () => {
    await act(async () => {
      render(
        <BpmSubmitForm
          session={mockSession}
          handleBpmGeneration={mockHandleBpmGeneration}
        />,
      );
    });
    const lowBpmInput = screen.getByPlaceholderText(
      'Enter lower BPM',
    ) as HTMLInputElement;
    const highBpmInput = screen.getByPlaceholderText(
      'Enter higher BPM',
    ) as HTMLInputElement;
    await act(async () => {
      fireEvent.change(lowBpmInput, { target: { value: '60' } });
      fireEvent.change(highBpmInput, { target: { value: '120' } });
    });

    expect(lowBpmInput.value).toBe('60');
    expect(highBpmInput.value).toBe('120');
  });

  // note: short-term, medium-term, and long-term are not currently implemented
  test('handles option checkbox changes', async () => {
    await act(async () => {
      render(
        <BpmSubmitForm
          session={mockSession}
          handleBpmGeneration={mockHandleBpmGeneration}
        />,
      );
    });
    const doubleSpeedCheckbox = screen.getByLabelText(
      'double speed',
    ) as HTMLInputElement;
    const halfSpeedCheckbox = screen.getByLabelText(
      'half speed',
    ) as HTMLInputElement;
    // const shortTermCheckbox = screen.getByLabelText(
    //   'Short Term',
    // ) as HTMLInputElement;
    // const mediumTermCheckbox = screen.getByLabelText(
    //   'Medium Term',
    // ) as HTMLInputElement;
    // const longTermCheckbox = screen.getByLabelText(
    //   'Long Term',
    // ) as HTMLInputElement;

    await act(async () => {
      fireEvent.click(doubleSpeedCheckbox);
      fireEvent.click(halfSpeedCheckbox);
    });
    // fireEvent.click(shortTermCheckbox);
    // fireEvent.click(mediumTermCheckbox);
    // fireEvent.click(longTermCheckbox);

    expect(doubleSpeedCheckbox.checked).toBe(true);
    expect(halfSpeedCheckbox.checked).toBe(true);
    // expect(shortTermCheckbox.checked).toBe(true);
    // expect(mediumTermCheckbox.checked).toBe(true);
    // expect(longTermCheckbox.checked).toBe(true);
  });

  test('submits the form with valid data', async () => {
    mockUseSelectedPlaylists.mockReturnValue({
      selectedPlaylists: [{ id: 'playlist1' }],
    });
    await act(async () => {
      render(
        <BpmSubmitForm
          session={mockSession}
          handleBpmGeneration={mockHandleBpmGeneration}
        />,
      );
    });

    const lowBpmInput = screen.getByPlaceholderText(
      'Enter lower BPM',
    ) as HTMLInputElement;
    const highBpmInput = screen.getByPlaceholderText(
      'Enter higher BPM',
    ) as HTMLInputElement;
    const generateButton = screen.getByRole('button', { name: /generate/i });
    await act(async () => {
      fireEvent.change(lowBpmInput, { target: { value: '60' } });
      fireEvent.change(highBpmInput, { target: { value: '120' } });
    });

    fireEvent.click(generateButton);

    expect(mockHandleBpmGeneration).toHaveBeenCalledWith({
      lowBpm: '60',
      highBpm: '120',
      doubleSpeed: false,
      halfSpeed: false,
      shortTerm: false,
      mediumTerm: false,
      longTerm: false,
      selectedPlaylists: [{ id: 'playlist1' }],
    });
  });

  test('prevents form submission with invalid data', async () => {
    await act(async () => {
      render(
        <BpmSubmitForm
          session={mockSession}
          handleBpmGeneration={mockHandleBpmGeneration}
        />,
      );
    });
    const generateButton = screen.getByRole('button', { name: /generate/i });

    fireEvent.click(generateButton);

    expect(mockHandleBpmGeneration).not.toHaveBeenCalled();
  });
});
