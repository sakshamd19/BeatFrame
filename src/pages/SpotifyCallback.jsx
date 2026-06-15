import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { exchangeCodeForTokens } from '../services/spotifyAuth';

export default function SpotifyCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setError('Spotify authorization failed: ' + errorParam);
        setTimeout(() => navigate('/settings'), 3000);
        return;
      }

      if (!code) {
        navigate('/settings');
        return;
      }

      try {
        // 1. Get tokens from Spotify
        const { refresh_token } = await exchangeCodeForTokens(code);

        // 2. Check if logged in
        if (!user) {
          throw new Error('Not logged in');
        }

        // 3. Save refresh token securely
        const { error: dbError } = await supabase
          .from('user_secrets')
          .upsert({
            id: user.id,
            spotify_refresh_token: refresh_token
          });

        if (dbError) throw dbError;

        // Redirect back
        navigate('/settings');
      } catch (err) {
        console.error('Error during Spotify callback:', err);
        setError('Failed to connect Spotify account. ' + err.message);
        setTimeout(() => navigate('/settings'), 3000);
      }
    };

    if (user) {
      handleCallback();
    }
  }, [searchParams, navigate, user]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
      {error ? (
        <div className="text-center">
          <div className="text-red-500 mb-4 font-bold text-xl">Error</div>
          <p className="text-[#9ca3af]">{error}</p>
        </div>
      ) : (
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#1db954] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Connecting to Spotify...</h2>
          <p className="text-[#9ca3af]">Please wait while we link your account.</p>
        </div>
      )}
    </div>
  );
}
