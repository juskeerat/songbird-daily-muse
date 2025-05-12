
// Utility functions for interacting with Spotify API

// Get a song recommendation based on user's history and preferences
export const getSongRecommendation = async (token: string) => {
  try {
    // First, get user's top tracks to understand preferences
    const topTracksResponse = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!topTracksResponse.ok) {
      throw new Error('Failed to fetch top tracks');
    }
    
    const topTracks = await topTracksResponse.json();
    
    // Extract seed tracks (up to 5) from top tracks
    const seedTracks = topTracks.items
      .slice(0, 5)
      .map((track: any) => track.id);
    
    // Get recommendations based on user's top tracks
    const recommendationsResponse = await fetch(
      `https://api.spotify.com/v1/recommendations?limit=1&seed_tracks=${seedTracks.join(',')}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    if (!recommendationsResponse.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    const recommendations = await recommendationsResponse.json();
    
    // Return the first recommendation
    return recommendations.tracks[0];
  } catch (error) {
    console.error('Error in Spotify API:', error);
    throw error;
  }
};

// Get user's profile information
export const getUserProfile = async (token: string) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

// Get user's top artists
export const getTopArtists = async (token: string) => {
  try {
    const response = await fetch('https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch top artists');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching top artists:', error);
    throw error;
  }
};

// Get audio features for a track (for better recommendations)
export const getAudioFeatures = async (token: string, trackId: string) => {
  try {
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch audio features');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching audio features:', error);
    throw error;
  }
};
