
// This file simulates AI-generated summaries about why a user might like a song
// In a real implementation, this would call an API like OpenAI or another LLM service

// Function to generate a summary about why the user might like the song
export const generateAiSummary = async (song: any, token: string) => {
  try {
    // In a real implementation, this would call an AI service and pass:
    // 1. The song information
    // 2. User's listening history
    // 3. User's preferences
    
    // For now, we'll generate a simulated response based on the song information
    // First, let's get audio features of the track to add more context
    const audioFeatures = await getTrackFeatures(token, song.id);
    
    // Create simulated summaries based on track features
    return generateSimulatedSummary(song, audioFeatures);
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return "Based on your listening habits, this track matches your taste profile with its unique sound and style. The artist's approach to composition and the track's energy level align well with other music you enjoy.";
  }
};

// Get audio features from Spotify API
const getTrackFeatures = async (token: string, trackId: string) => {
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
    // Return default features if API call fails
    return {
      energy: 0.6,
      valence: 0.5,
      tempo: 120,
      danceability: 0.5,
      acousticness: 0.3,
      instrumentalness: 0.1,
    };
  }
};

// Generate a simulated AI summary based on track features
const generateSimulatedSummary = (song: any, features: any) => {
  // Extract artist info
  const artistName = song.artists[0]?.name || "This artist";
  
  // Generate description based on audio features
  const energyDescription = features.energy > 0.7 
    ? "high-energy" 
    : features.energy < 0.4 
      ? "laid-back" 
      : "mid-tempo";
  
  const moodDescription = features.valence > 0.7 
    ? "uplifting" 
    : features.valence < 0.4 
      ? "introspective" 
      : "balanced";
  
  const tempoDescription = features.tempo > 120 
    ? "fast-paced" 
    : features.tempo < 90 
      ? "slower" 
      : "moderate";
  
  const danceDescription = features.danceability > 0.7 
    ? "danceable rhythms" 
    : "";
  
  const acousticDescription = features.acousticness > 0.6 
    ? "acoustic elements" 
    : "";
  
  const instrumentalDescription = features.instrumentalness > 0.5 
    ? "instrumental sections" 
    : "";
  
  // Build the features description
  let featuresArray = [
    energyDescription,
    moodDescription,
    danceDescription,
    acousticDescription,
    instrumentalDescription
  ].filter(Boolean);
  
  // Generate the final summary
  const summaryTemplates = [
    `This ${energyDescription} track by ${artistName} matches your preference for ${moodDescription} music with ${tempoDescription} beats. ${featuresArray.length > 2 ? `You'll appreciate its ${featuresArray.slice(0, -1).join(', ')} and ${featuresArray.slice(-1)}` : ''}.`,
    
    `Based on your listening history, you might enjoy this ${moodDescription} song that features ${artistName}'s signature style. The ${energyDescription} production and ${tempoDescription} rhythm align with other tracks you frequently play.`,
    
    `${artistName}'s ${energyDescription} approach in this track complements your taste for ${moodDescription} music. ${featuresArray.length > 0 ? `The ${featuresArray.join(' and ')} should resonate with your musical preferences.` : ''}`,
    
    `Your playlist history suggests you enjoy ${moodDescription} tracks like this one. ${artistName} delivers ${featuresArray.length > 0 ? `the ${featuresArray.join(' and ')} that appear` : 'elements that appear'} in many of your favorite songs.`
  ];
  
  // Select a random template
  return summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
};
