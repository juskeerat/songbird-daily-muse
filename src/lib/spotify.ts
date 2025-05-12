import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || 
  (window.location.hostname === 'localhost' 
    ? 'http://localhost:5173/callback'
    : 'https://songoftheday-tawny.vercel.app/callback');

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
    'playlist-modify-private',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-modify-playback-state'
  ]
);

// Helper to ensure we have a valid token
const ensureToken = async () => {
  try {
    const token = await spotifyApi.getAccessToken();
    if (!token) {
      console.error('No token available');
      // Redirect to login if no token
      window.location.href = '/';
      throw new Error('No access token available');
    }

    // Log token details (without exposing the actual token)
    console.log('Token details:', {
      hasToken: !!token,
      hasAccessToken: !!token.access_token,
      tokenType: token.token_type,
      expiresIn: token.expires_in
    });

    return token;
  } catch (error) {
    console.error('Token error:', error);
    // Clear any invalid token and redirect to login
    localStorage.removeItem('spotify_token');
    window.location.href = '/';
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
    const token = await ensureToken();
    console.log('Getting recommendations with seed tracks:', seedTracks);

    if (!seedTracks || seedTracks.length === 0) {
      throw new Error('No seed tracks provided');
    }

    const seeds = seedTracks.slice(0, 5);
    console.log('Using seed tracks:', seeds);

    // Log the exact parameters being sent
    const params = {
      seed_tracks: seeds,
      limit: 1,
      market: 'US'
    };
    console.log('Recommendations parameters:', params);

    // Use the SDK's built-in call
    const data = await spotifyApi.recommendations.get(params);
    console.log('Recommendations response:', data);

    if (!data.tracks || data.tracks.length === 0) {
      throw new Error('No recommendations found');
    }

    return data.tracks[0];
  } catch (error) {
    console.error('Error getting recommendations:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    throw error;
  }
};
