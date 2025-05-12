import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 'http://localhost:5173/callback';

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
  try {
    const token = await spotifyApi.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }
    return token;
  } catch (error) {
    console.error('Token error:', error);
    throw error;
  }
};

export const getTopTracks = async (timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') => {
  try {
    await ensureToken();
    console.log('Fetching top tracks with timeRange:', timeRange);
    const response = await spotifyApi.currentUser.topItems('tracks', timeRange, 5);
    console.log('Top tracks response:', response);
    
    if (!response.items || response.items.length === 0) {
      throw new Error('No top tracks found');
    }

    // Log the track IDs to verify they're valid
    const trackIds = response.items.map(track => track.id);
    console.log('Track IDs:', trackIds);

    return response.items;
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    throw error;
  }
};

export const getRecentlyPlayed = async () => {
  try {
    await ensureToken();
    const response = await spotifyApi.player.getRecentlyPlayedTracks();
    return response.items;
  } catch (error) {
    console.error('Error fetching recently played:', error);
    throw error;
  }
};

export const getRecommendations = async (seedTracks: string[]) => {
  try {
    await ensureToken();
    console.log('Getting recommendations with seed tracks:', seedTracks);
    
    if (!seedTracks || seedTracks.length === 0) {
      throw new Error('No seed tracks provided');
    }

    // Ensure we have exactly 5 seed tracks
    const seeds = seedTracks.slice(0, 5);
    console.log('Using seed tracks:', seeds);

    // Make the API call with the correct parameters
    const response = await spotifyApi.recommendations.get({
      seed_tracks: seeds.join(',') as unknown as string[], // Type assertion to match SDK's expected type
      limit: 1,
      min_popularity: 50,
      market: 'US',
      // Add some additional parameters to improve recommendations
      target_popularity: 70,
      min_energy: 0.4,
      min_danceability: 0.4
    });

    console.log('Recommendations response:', response);
    
    if (!response.tracks || response.tracks.length === 0) {
      throw new Error('No recommendations found');
    }

    return response.tracks[0];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
}; 