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
    console.log('Checking localStorage for token...');
    const token = localStorage.getItem('spotify_access_token');
    console.log('Token found:', !!token);
    
    if (!token) {
      console.error('No token found in localStorage');
      throw new Error('Missing or invalid Spotify access token');
    }

    const params = new URLSearchParams({
      seed_tracks: seedTracks.slice(0, 5).join(','),
      limit: '1',
      market: 'US',
    });

    const res = await fetch(`https://api.spotify.com/v1/recommendations?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ Make sure it's just the token string
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Spotify API error ${res.status}: ${body}`);
    }

    const data = await res.json();
    console.log('✅ Fetched recommendations:', data);
    return data.tracks[0];
  } catch (err) {
    console.error('❌ Recommendation error:', err);
    throw err;
  }
};


