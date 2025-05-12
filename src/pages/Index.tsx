
import { useState } from 'react';
import SpotifyAuth from '@/components/SpotifyAuth';
import SongRecommendation from '@/components/SongRecommendation';
import PhoneNumberForm from '@/components/PhoneNumberForm';

const Index = () => {
  const [spotifyToken, setSpotifyToken] = useState<string>(
    localStorage.getItem('spotify_access_token') || ''
  );
  const [phoneNumber, setPhoneNumber] = useState<string>(
    localStorage.getItem('user_phone') || ''
  );
  
  const handleAuthSuccess = (token: string) => {
    setSpotifyToken(token);
  };
  
  const handlePhoneSubmit = (phone: string) => {
    localStorage.setItem('user_phone', phone);
    setPhoneNumber(phone);
  };
  
  return (
    <div className="min-h-screen bg-gradient-spotify">
      <div className="container px-4 py-12 mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Daily Song Discovery
          </h1>
          <p className="text-spotify-lightgray md:text-lg max-w-2xl mx-auto">
            Get personalized song recommendations delivered to your phone every day,
            with AI-powered insights on why you'll love them.
          </p>
        </header>
        
        <main className="space-y-10">
          {!spotifyToken ? (
            <SpotifyAuth onAuthSuccess={handleAuthSuccess} />
          ) : (
            <>
              <section className="mb-10">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Your Song of the Day
                </h2>
                <SongRecommendation spotifyToken={spotifyToken} />
              </section>
              
              {!phoneNumber && (
                <section>
                  <PhoneNumberForm onSubmit={handlePhoneSubmit} />
                </section>
              )}
              
              {phoneNumber && (
                <section className="bg-gradient-card rounded-xl p-6 text-center">
                  <h2 className="text-xl font-bold text-white mb-2">You're All Set!</h2>
                  <p className="text-spotify-lightgray">
                    You'll receive a new song recommendation every day at 9am to {phoneNumber}.
                  </p>
                </section>
              )}
            </>
          )}
        </main>
        
        <footer className="mt-20 text-center text-spotify-lightgray text-sm">
          <p>
            Not affiliated with Spotify. This app uses the Spotify API to provide personalized recommendations.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
