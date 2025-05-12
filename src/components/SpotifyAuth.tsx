
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface SpotifyAuthProps {
  onAuthSuccess: (token: string) => void;
}

const SpotifyAuth = ({ onAuthSuccess }: SpotifyAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const clientId = "fd7011ecd100494e8d38dbf2c4d8aa17"; // Replace with your Spotify Client ID
  const redirectUri = window.location.origin;
  const scopes = [
    'user-read-private',
    'user-read-email',
    'user-top-read',
    'user-library-read',
    'user-read-recently-played'
  ];

  const handleLogin = () => {
    setIsLoading(true);
    
    // Store a random state value to prevent CSRF attacks
    const state = generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);
    
    // Build the Spotify authorization URL
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'token');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('state', state);
    
    // Redirect to Spotify login
    window.location.href = authUrl.toString();
  };
  
  // Check for token in URL hash on component mount
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get('access_token');
      const state = params.get('state');
      const storedState = localStorage.getItem('spotify_auth_state');
      
      // Clear the hash from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (token && state === storedState) {
        localStorage.setItem('spotify_access_token', token);
        onAuthSuccess(token);
        toast({
          title: "Successfully connected to Spotify",
          description: "We'll now find the perfect songs for you!",
        });
      } else if (state !== storedState) {
        toast({
          title: "Authentication Error",
          description: "There was a security issue with your Spotify login.",
          variant: "destructive",
        });
      }
    }
    setIsLoading(false);
  }, [onAuthSuccess, toast]);
  
  return (
    <div className="flex flex-col items-center gap-6 p-6 rounded-xl bg-gradient-card">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-3">Connect Your Spotify</h2>
        <p className="text-spotify-lightgray mb-6">
          We need access to your listening history to provide personalized recommendations.
        </p>
      </div>
      
      <Button 
        onClick={handleLogin} 
        disabled={isLoading}
        size="lg"
        className="bg-spotify-green hover:bg-spotify-green/90 text-white font-semibold px-8 py-6 rounded-full flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <SpotifyLogo className="h-6 w-6" />
            Connecting...
          </>
        ) : (
          <>
            <SpotifyLogo className="h-6 w-6" />
            Connect with Spotify
          </>
        )}
      </Button>
      
      <p className="text-xs text-muted-foreground mt-4 max-w-md text-center">
        By connecting, you allow us to access your listening history and liked songs
        to provide personalized recommendations.
      </p>
    </div>
  );
};

// Helper function to generate a random string
const generateRandomString = (length: number) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
};

// Spotify Logo component
const SpotifyLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM16.586 16.424C16.427 16.67 16.162 16.787 15.913 16.787C15.767 16.787 15.619 16.745 15.486 16.658C14.5 16.043 13.323 15.715 12.014 15.715C10.877 15.715 9.764 15.952 8.761 16.414C8.444 16.558 8.076 16.414 7.932 16.097C7.788 15.78 7.932 15.412 8.249 15.268C9.411 14.736 10.701 14.458 12.014 14.458C13.535 14.458 14.919 14.838 16.093 15.571C16.384 15.751 16.458 16.133 16.278 16.424H16.586V16.424ZM17.81 13.7C17.615 14.002 17.289 14.149 16.976 14.149C16.8 14.149 16.622 14.099 16.459 13.995C15.229 13.237 13.75 12.831 12.111 12.831C10.671 12.831 9.343 13.134 8.206 13.724C7.823 13.903 7.375 13.716 7.196 13.333C7.017 12.949 7.204 12.501 7.587 12.322C8.906 11.634 10.441 11.282 12.111 11.282C14.02 11.282 15.767 11.755 17.229 12.665C17.587 12.88 17.693 13.342 17.478 13.7H17.81ZM19.085 10.55C18.855 10.909 18.465 11.084 18.09 11.084C17.888 11.084 17.683 11.028 17.496 10.909C16.034 10.026 14.17 9.551 12.173 9.551C10.519 9.551 8.937 9.9 7.525 10.581C7.075 10.786 6.559 10.566 6.354 10.115C6.148 9.665 6.369 9.15 6.819 8.944C8.445 8.155 10.271 7.75 12.173 7.75C14.468 7.75 16.632 8.303 18.352 9.361C18.773 9.623 18.9 10.166 18.638 10.587L19.085 10.55Z" 
      fill="currentColor"
    />
  </svg>
);

export default SpotifyAuth;
