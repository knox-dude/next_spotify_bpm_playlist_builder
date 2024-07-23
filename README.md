# Spotify BPM Playlist Builder

[Deployed Link](https://spotify-bpm-playlist-builder.vercel.app/)

Spotify BPM Playlist Builder is a web app that lets users build playlists based off of a BPM (beats per minute) range. It analyzes the user's playlists, then grabs songs that match the BPM range the user indicated. It's intended to facilitate playlist creation for jogging, walking, or any activity that syncs up to a rhythmic pace. Built with React, Typescript, Tailwind, and NextJS.

## Features

- Spotify OAuth for verification
- View all the playlists created or followed by the user
- Display all tracks from chosen playlists that match BPM range
- Create new playlists with songs that match BPM range

## Run Locally

Clone the project

```bash
  git clone https://github.com/knox-dude/next_spotify_bpm_playlist_builder
```

Go to the project directory

```bash
  cd next_spotify_bpm_playlist_builder
```

Install dependencies

```bash
  npm install
  # or
  yarn
```

Install the environment variables and setup a spotify API secret

## Installing environment variables

To run this project, you will need to add the following environment variables to your .env file

`SPOTIFY_CLIENT_SECRET`

`SPOTIFY_CLIENT_ID`

`NEXTAUTH_SECRET`

#### Spotify API credentials

- **Step 1**: Go to the [Spotify's developer dashboard](https://developer.spotify.com/dashboard/) and log in with your Spotify credentials
- **Step 2**: Click on **CREATE AN APP** button on the applications page. Enter the name and description for the application.
- **Step 3**: After creating the application, copy the **Client ID** and **Client Secret** and paste it into the .env file.
- **Step 4**: In the application page itself, click on **Edit Settings** button. Under the **Redirect URIs** section, add the redirect URL in the text field provided as follows:

  `http://localhost:3000/api/auth/callback/spotify`

  When the project is deployed, add another redirect URL as follows:

  `https://xyz.domain/api/auth/callback/spotify`

- **Step 5**: In the **Users and Access** page, add the email addresses for the accounts you want to test the application for. Your own account is enabled by default so no there's no need to add your own account's email.

#### NEXTAUTH_SECRET

To create a secret key, open your terminal, run the command below and copy the value generated to the .env file.

```bash
openssl rand -base64 32
```

## To-do features

- Implement functionality for top songs (not high priority since most people can only use the Test account)
- Handle duplicate songs that are present in multiple playlists
- Add a logout button (lol, it's actually not that necessary)
- Add a mobile layout (grrrrrr I know, I know, it's necessary... but at what cost to my sanity...)

## Disclaimer

A small portion of the source code was adapted from [Next Spotify V2](https://github.com/ankitk26/Next-Spotify-v2) by [ankitk26](https://github.com/ankitk26) - thank you Ankit! All files that were copied partially or fully have disclaimers at the top of the file.

Additionally, types found in updatedTypes.ts were taken from the [Spotify Web API TS SDK](https://github.com/spotify/spotify-web-api-ts-sdk/tree/main)
