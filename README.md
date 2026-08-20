# Spotify BPM Playlist Builder

[Deployed Link](https://spotify-bpm-playlist-builder.vercel.app/)

Spotify BPM Playlist Builder is a web app that lets users build playlists based off of a BPM (beats per minute) range. It analyzes the user's playlists, then grabs songs that match the BPM range the user indicated. It's intended to facilitate playlist creation for jogging, walking, or any activity that syncs up to a rhythmic pace. Built with React, Typescript, Tailwind, and NextJS.

## Features

- Spotify OAuth for verification
- View all the playlists created or followed by the user
- Scan Liked Songs and your top tracks (last 4 weeks / 6 months / year)
- Display all tracks from chosen sources that match BPM range, grouped by
  artist, album, genre, or tempo band — not by the playlist they came from,
  which stops being interesting once a song has a tempo
- Create new playlists with songs that match BPM range

## Where BPM data comes from

Spotify **deprecated the `/audio-features` endpoint on 2024-11-27**. It now
returns `403` for every app that didn't already hold extended quota access, and
there is still no official replacement. That endpoint was the app's only source
of tempo, so BPM is now sourced from third parties in two passes:

| Pass | Source | Keyed on | Auth | Notes |
| --- | --- | --- | --- | --- |
| 1 | [ReccoBeats](https://reccobeats.com) | Spotify track id | none | 40 ids/request |
| 2 | [Deezer](https://developers.deezer.com/api) | ISRC | none | only for pass-1 misses |

**Neither provider requires an account or an API key**, so there is nothing extra
to sign up for.

Measured against 276 real Spotify tracks spanning genres and eras, pass 1 alone
resolves ~79% and the Deezer fallback lifts that to ~85%. That sample was
deliberately weighted toward obscure catalogue entries; on a realistic playlist
(a 117-track running playlist) the combined figure was ~81%, with 15 of the 95
hits coming from the Deezer fallback. Tracks with no tempo from either provider
are simply left out of the results.

Tempos are cached per server instance and de-duplicated across playlists, so a
song appearing in ten playlists is looked up once.

### Genre

Spotify has no per-track or per-album genre — only artists carry one. Once a
scan has its matches, the primary artist of each match is resolved through
`/v1/artists` (50 per request) and the first genre listed is used for grouping.
Artists Spotify has no genre for land in a "No genre" bucket that always sorts
last.

## How long a scan takes

The work is bounded by two free APIs, so the pipeline is built to keep as much
in flight as it safely can:

| Stage | Shape |
| --- | --- |
| Paging one source | First page gives `total`, remaining pages fetched by offset, 5 at a time |
| Collecting sources | 4 sources at a time, each its own server action |
| Tempo lookups | 120 tracks per call, 3 calls at a time |
| Providers | 3 ReccoBeats batches / 2 Deezer lookups per call, with 429 back-off |

Pagination used to run in the browser — one server round trip per 50-track page,
each waiting on the previous one's `next` link — which is what made a large
library feel endless. It now happens inside a single server call per source.

### If a provider breaks

The pipeline depends on undocumented behaviour of a free API (notably that
ReccoBeats echoes the Spotify id back in its `href` field). There's an opt-in
contract test for exactly that:

```bash
RUN_LIVE_BPM_TESTS=1 npx jest bpm.live
```

Adding another provider means writing one function that returns a `TempoAnalysis`
and slotting it into the cascade in `app/lib/bpm/index.ts`.

## To Do

- Make login/authentication work for Google, Facebook, and Apple
- **Apple Music support.** Apple's MusicKit API still exposes tempo directly, so
  it would be a first-class BPM source rather than a fallback. It needs an Apple
  Developer account ($99/yr) and a MusicKit private key, plus a separate
  auth flow — the `app/lib/bpm` provider cascade is the seam to plug it into.
- Recover more of the ~15-20% of tracks with no tempo (searching Spotify by ISRC
  for alternate track ids and re-querying ReccoBeats was measured at roughly
  +2pp — real, but it costs one extra Spotify search per missing track)

## Run Locally

### Requirements

**Node 24** (`Krypton`, the active LTS). Node 22 went into maintenance in October
2025 and stops getting security fixes in April 2027, so the project is pinned
ahead of that. The version lives in `.nvmrc` and in `engines` in `package.json`,
which is also what Vercel reads when picking a runtime for the deployment.

```bash
  nvm use   # or: nvm install 24
```

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

### Dependency pins worth knowing about

`overrides` in `package.json` forces fixed versions of four transitive
packages (`postcss`, `sharp`, `glob`, `brace-expansion`) that their parents
still ask for vulnerable versions of. They are all same-major bumps. Drop an
override once its parent catches up - `npm audit` will stay quiet either way,
which is the point of checking it rather than the override list.

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

- ~~Implement functionality for top songs~~ (done — selectable as top tracks over three time ranges)
- ~~Handle duplicate songs that are present in multiple playlists~~ (done — de-duplicated before lookup)
- ~~Add a logout button~~ (done)
- Add a mobile layout (grrrrrr I know, I know, it's necessary... but at what cost to my sanity...)
- Show which provider a BPM came from, so odd-looking values can be sanity-checked

## Disclaimer

A small portion of the source code was adapted from [Next Spotify V2](https://github.com/ankitk26/Next-Spotify-v2) by [ankitk26](https://github.com/ankitk26) - thank you Ankit! All files that were copied partially or fully have disclaimers at the top of the file.

Additionally, types found in updatedTypes.ts were taken from the [Spotify Web API TS SDK](https://github.com/spotify/spotify-web-api-ts-sdk/tree/main)
