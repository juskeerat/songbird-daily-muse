import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/#/callback';

// Create the Spotify API instance with token persistence
export const spotifyApi = SpotifyApi.withUserAuthorization(
  CLIENT_ID,
  REDIRECT_URI,
  [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-read-recently-played',
    'playlist-modify-public',
    'playlist-modify-private'
  ]
);

// Helper to ensure we have a valid token
const ensureToken = async () => {
  const token = localStorage.getItem('spotify_access_token');
  if (token) {
    try {
      await spotifyApi.currentUser.profile();
    } catch (error) {
      localStorage.removeItem('spotify_access_token');
      window.location.href = '/';
    }
  }
};

export const getTopTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') => {
  await ensureToken();
  const response = await spotifyApi.currentUser.topItems.tracks(timeRange);
  return response.items;
};

export const getRecentlyPlayed = async () => {
  await ensureToken();
  const response = await spotifyApi.player.getRecentlyPlayedTracks();
  return response.items;
};

export const getRecommendations = async (seedTracks: string[]) => {
  await ensureToken();
  const response = await spotifyApi.recommendations.get({
    seed_tracks: seedTracks.slice(0, 5),
    limit: 1,
  });
  return response.tracks[0];
}; 