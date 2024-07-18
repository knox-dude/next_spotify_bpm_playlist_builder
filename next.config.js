/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'i2o.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 't.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'newjams-images.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'dailymix-images.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'seed-mix-image.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'wrapped-images.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'charts-images.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'daily-mix.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'blend-playlist-covers.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'mixed-media-images.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'lineup-images.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'thisis-images.scdn.co',
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-fa.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'lexicon-assets.spotifycdn.com',
      },
      {
        protocol: 'https',
        hostname: 'image-cdn-ak.spotifycdn.com',
      },
    ],
  },
};

module.exports = nextConfig;
