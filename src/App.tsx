import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { spotifyApi, getTopTracks, getRecommendations } from './lib/spotify';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Toaster } from './components/ui/toaster';
import { useToast } from './components/ui/use-toast';

// Create a context to share authentication state
import { createContext, useContext } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

function CallbackHandler() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
          // Complete the authentication
          await spotifyApi.authenticate();
          
          // Verify we can get the token
          const token = await spotifyApi.getAccessToken();
          if (token) {
            setIsAuthenticated(true);
            toast({
              title: "Successfully connected!",
              description: "You can now get your daily song recommendations.",
            });
            navigate('/');
          } else {
            throw new Error('Failed to get access token');
          }
        } else {
          throw new Error('No authorization code found');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setIsAuthenticated(false);
        toast({
          title: "Error",
          description: "Failed to connect to Spotify. Please try again.",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, toast, setIsAuthenticated]);

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
  const { setIsAuthenticated } = useContext(AuthContext);

  const getDailyRecommendation = async () => {
    try {
      console.log('Getting top tracks...');
      const topTracks = await getTopTracks();
      console.log('Top tracks:', topTracks);
      
      if (!topTracks || topTracks.length === 0) {
        throw new Error('No top tracks found');
      }

      const seedTracks = topTracks.map(track => track.id);
      console.log('Seed tracks:', seedTracks);
      
      console.log('Getting recommendations...');
      const recommendation = await getRecommendations(seedTracks);
      console.log('Recommendation:', recommendation);
      
      if (!recommendation) {
        throw new Error('No recommendation received');
      }
      
      setDailySong(recommendation);
      
      toast({
        title: "Your Daily Song is Ready!",
        description: "Check out your personalized recommendation.",
      });
    } catch (error) {
      console.error('Detailed recommendation error:', error);
      
      // If we get an authentication error, redirect to login
      if ((error as any)?.status === 401) {
        setIsAuthenticated(false);
        navigate('/');
        return;
      }

      // Show more specific error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to get your daily recommendation';
      toast({
        title: "Error",
        description: errorMessage,
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
        const token = await spotifyApi.getAccessToken();
        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-8">
          <Routes>
            <Route path="/callback" element={<CallbackHandler />} />
            <Route path="/" element={isAuthenticated ? <HomePage /> : <LoginPage />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
