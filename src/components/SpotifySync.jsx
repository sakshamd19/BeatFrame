import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { getAccessTokenFromRefresh, fetchSpotifyActivity } from '../services/spotifyAuth';

export default function SpotifySync() {
  const { user } = useAuth();
  useEffect(() => {
    let timeoutId;

    const syncSpotify = async () => {
      try {
        // 1. Check if logged in
        if (!user) return;

        // 2. Check if we have a refresh token
        const { data: secret } = await supabase
          .from('user_secrets')
          .select('spotify_refresh_token')
          .eq('id', user.id)
          .single();

        if (!secret?.spotify_refresh_token) return;

        // 3. Get fresh access token
        const { access_token } = await getAccessTokenFromRefresh(secret.spotify_refresh_token);

        // 4. Fetch activity
        const activity = await fetchSpotifyActivity(access_token);

        // 5. Update public profile
        await supabase
          .from('profiles')
          .update({ spotify_activity: activity })
          .eq('id', user.id);

      } catch (err) {
        console.error('Background Spotify Sync Error:', err);
      } finally {
        // Schedule next sync in 5 minutes (300000ms)
        timeoutId = setTimeout(syncSpotify, 300000);
      }
    };

    // Run initial sync after 2 seconds to not block UI rendering
    timeoutId = setTimeout(syncSpotify, 2000);

    return () => clearTimeout(timeoutId);
  }, [user]);

  return null; // Invisible worker component
}
