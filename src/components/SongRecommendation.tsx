
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSongRecommendation } from '@/utils/spotifyApi';
import { generateAiSummary } from '@/utils/aiSummary';

interface SongRecommendationProps {
  spotifyToken: string;
}

interface Song {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
  preview_url: string | null;
}

const SongRecommendation = ({ spotifyToken }: SongRecommendationProps) => {
  const [song, setSong] = useState<Song | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    const fetchRecommendation = async () => {
      setLoading(true);
      try {
        const recommendation = await getSongRecommendation(spotifyToken);
        setSong(recommendation);
        setSummaryLoading(true);
        
        // Get AI summary of why user might like this song
        const aiSummary = await generateAiSummary(recommendation, spotifyToken);
        setSummary(aiSummary);
      } catch (error) {
        console.error('Error fetching recommendation:', error);
      } finally {
        setLoading(false);
        setSummaryLoading(false);
      }
    };
    
    if (spotifyToken) {
      fetchRecommendation();
    }
    
    return () => {
      // Clean up audio on unmount
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [spotifyToken]);
  
  const handlePlayPreview = () => {
    if (!song?.preview_url) return;
    
    if (!audio) {
      const newAudio = new Audio(song.preview_url);
      newAudio.addEventListener('ended', () => setIsPlaying(false));
      setAudio(newAudio);
      newAudio.play();
      setIsPlaying(true);
    } else {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="waveform-container mb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="waveform-bar"></div>
          ))}
        </div>
        <p className="text-spotify-lightgray">Finding your perfect song...</p>
      </div>
    );
  }
  
  if (!song) {
    return (
      <div className="text-center p-6">
        <p className="text-spotify-lightgray">No recommendation available. Please try again later.</p>
      </div>
    );
  }
  
  return (
    <Card className="overflow-hidden bg-gradient-card border-none shadow-xl">
      <CardContent className="p-0">
        <div className="md:flex">
          {/* Album Art Section */}
          <div className="relative md:w-1/2 aspect-square overflow-hidden flex items-center justify-center bg-gradient-to-br from-spotify-darkgray to-black p-6">
            <div className={`rounded-full overflow-hidden ${isPlaying ? 'album-rotate' : ''}`}>
              <img 
                src={song.album.images[0]?.url || '/placeholder.svg'} 
                alt={`${song.album.name} cover`} 
                className="w-full h-full object-cover"
              />
            </div>
            
            {song.preview_url && (
              <Button
                onClick={handlePlayPreview}
                className="absolute bottom-8 right-8 rounded-full w-14 h-14 bg-spotify-green hover:bg-spotify-green/90 flex items-center justify-center shadow-lg"
              >
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pause">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-play">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                )}
              </Button>
            )}
            
            {isPlaying && (
              <div className="absolute top-6 left-6 waveform-container">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="waveform-bar"></div>
                ))}
              </div>
            )}
          </div>
          
          {/* Song Info Section */}
          <div className="md:w-1/2 p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">{song.name}</h3>
              <p className="text-spotify-lightgray mb-4">
                {song.artists.map(artist => artist.name).join(', ')}
              </p>
              <p className="text-xs text-muted-foreground mb-6">
                Album: {song.album.name}
              </p>
              
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-white mb-2">Why you might like it:</h4>
                {summaryLoading ? (
                  <p className="text-spotify-lightgray text-sm animate-pulse">Generating your personalized summary...</p>
                ) : (
                  <p className="text-spotify-lightgray text-sm">{summary}</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                asChild
                className="flex-1 bg-spotify-green hover:bg-spotify-green/90 text-white rounded-full"
              >
                <a href={song.external_urls.spotify} target="_blank" rel="noopener noreferrer">
                  Open in Spotify
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SongRecommendation;
