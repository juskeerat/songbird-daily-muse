import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

interface Track {
  name: string;
  artists: { name: string }[];
  album: { name: string };
}

export const generateSongExplanation = async (
  recommendedTrack: Track,
  userTopTracks: Track[]
): Promise<string> => {
  const prompt = `Given the following song recommendation and user's top tracks, explain why they might like this song:

Recommended Song: ${recommendedTrack.name} by ${recommendedTrack.artists.map(a => a.name).join(', ')}
Album: ${recommendedTrack.album.name}

User's Top Tracks:
${userTopTracks.slice(0, 5).map(track => 
  `- ${track.name} by ${track.artists.map(a => a.name).join(', ')}`
).join('\n')}

Please provide a brief, engaging explanation (2-3 sentences) of why this song might appeal to the user based on their listening history.`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
    max_tokens: 150,
  });

  return completion.choices[0].message.content || "This song matches your taste in music!";
}; 