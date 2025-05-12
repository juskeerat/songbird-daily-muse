import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { spotifyApi, getTopTracks, getRecommendations } from './lib/spotify';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dailySong, setDailySong] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await spotifyApi.currentUser.profile();
        setIsAuthenticated(true);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = () => {
    spotifyApi.authenticate();
  };

  const getDailyRecommendation = async () => {
    try {
      const topTracks = await getTopTracks();
      const seedTracks = topTracks.map(track => track.id);
      const recommendation = await getRecommendations(seedTracks);
      
      setDailySong(recommendation);
      
      toast({
        title: "Your Daily Song is Ready!",
        description: "Check out your personalized recommendation.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get your daily recommendation. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>Welcome to Songbird</CardTitle>
            <CardDescription>Your daily musical companion</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogin} className="w-full">
              Connect with Spotify
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-8">
        <Routes>
          <Route path="/" element={
            <div className="max-w-2xl mx-auto">
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Your Daily Song</CardTitle>
                  <CardDescription>Discover your personalized recommendation</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailySong ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={dailySong.album.images[0]?.url} 
                          alt={dailySong.name}
                          className="w-24 h-24 rounded-lg"
                        />
                        <div>
                          <h3 className="text-xl font-bold">{dailySong.name}</h3>
                          <p className="text-gray-600">
                            {dailySong.artists.map((artist: any) => artist.name).join(', ')}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Based on your recent listening history
                          </p>
                        </div>
                      </div>
                      <Button onClick={getDailyRecommendation}>
                        Get New Recommendation
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={getDailyRecommendation}>
                      Get Your Daily Song
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          } />
          <Route path="/callback" element={<Navigate to="/" />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
