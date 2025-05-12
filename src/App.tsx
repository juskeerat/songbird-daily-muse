import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { spotifyApi, getTopTracks, getRecommendations } from './lib/spotify';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';

function CallbackHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          // Store the code temporarily
          localStorage.setItem('spotify_code', code);
          
          // Complete the authentication
          await spotifyApi.authenticate();
          
          toast({
            title: "Successfully connected!",
            description: "You can now get your daily song recommendations.",
          });
          navigate('/');
        } else {
          throw new Error('No authorization code found');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        toast({
          title: "Error",
          description: "Failed to connect to Spotify. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Connecting to Spotify</CardTitle>
          <CardDescription>Please wait while we set up your connection...</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

function LoginPage() {
  const handleLogin = () => {
    // Clear any existing tokens before starting new auth flow
    localStorage.removeItem('spotify_access_token');
    spotifyApi.authenticate();
  };

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

function HomePage() {
  const [dailySong, setDailySong] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      console.error('Recommendation error:', error);
      // If we get an authentication error, redirect to login
      if ((error as any)?.status === 401) {
        localStorage.removeItem('spotify_access_token');
        navigate('/');
        return;
      }
      toast({
        title: "Error",
        description: "Failed to get your daily recommendation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
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
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('spotify_access_token');
        if (!token) {
          setIsAuthenticated(false);
          return;
        }
        
        // Test the token by making a request
        await spotifyApi.currentUser.profile();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('spotify_access_token');
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-8">
        <Routes>
          <Route path="/callback" element={<CallbackHandler />} />
          <Route path="/" element={isAuthenticated ? <HomePage /> : <LoginPage />} />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
