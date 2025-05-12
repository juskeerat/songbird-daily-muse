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
    'user-read-currently-playing'
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
    const accessToken = await ensureToken();
    console.log('Getting recommendations with seed tracks:', seedTracks);
    
    if (!seedTracks || seedTracks.length === 0) {
      throw new Error('No seed tracks provided');
    }

    // Ensure we have exactly 5 seed tracks
    //const seeds = seedTracks.slice(0, 5);
    const seeds = ['3n3Ppam7vgaVa1iaRUc9Lp', '0eGsygTp906u18L0Oimnem', '7ouMYWpwJ422jRcDASZB7P', '1oR3KrPIp4CbagPa3PhtPp', '4VqPOruhp5EdPBeR92t6lQ'];
    console.log('Using seed tracks:', seeds);

    // Make a direct API call to the recommendations endpoint
    const url = new URL('https://api.spotify.com/v1/recommendations');
    url.searchParams.append('seed_tracks', seeds.join(','));
    url.searchParams.append('limit', '1');

    console.log('Calling recommendations API:', url.toString());

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Spotify API error:', {
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
        error: errorText
      });
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
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