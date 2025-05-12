import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/callback';

export const spotifyApi = SpotifyApi.withUserAuthorization(
  CLIENT_ID,
  REDIRECT_URI,
  ['user-read-private', 'user-read-email', 'user-top-read', 'user-read-recently-played']
);

export const getTopTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') => {
  const response = await spotifyApi.currentUser.topItems.tracks(timeRange);
  return response.items;
};

export const getRecentlyPlayed = async () => {
  const response = await spotifyApi.player.getRecentlyPlayedTracks();
  return response.items;
};

export const getRecommendations = async (seedTracks: string[]) => {
  const response = await spotifyApi.recommendations.get({
    seed_tracks: seedTracks.slice(0, 5),
    limit: 1,
  });
  return response.tracks[0];
}; 