import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Music, CheckCircle, Edit3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getAccessTokenFromRefresh, fetchSpotifyActivity } from '../services/spotifyAuth';

export default function Rewind() {
  const [activity, setActivity] = useState(null);
  const [reviewedTracks, setReviewedTracks] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const accessTokenRef = useRef({ token: null, expiresAt: 0 });

  useEffect(() => {
    let intervalId;

    const fetchHistory = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      let currentActivity = null;

      // 1. Try to fetch live data if we have the secret
      try {
        let access_token = accessTokenRef.current.token;

        if (!access_token || Date.now() > accessTokenRef.current.expiresAt) {
          const { data: secretData } = await supabase
            .from('user_secrets')
            .select('spotify_refresh_token')
            .eq('id', user.id)
            .single();

          if (secretData?.spotify_refresh_token) {
            const tokenResponse = await getAccessTokenFromRefresh(secretData.spotify_refresh_token);
            if (tokenResponse.access_token) {
              access_token = tokenResponse.access_token;
              accessTokenRef.current = {
                token: access_token,
                expiresAt: Date.now() + (tokenResponse.expires_in * 1000) - 60000 // expire 1 min early
              };
            }
          }
        }

        if (access_token) {
          const freshActivity = await fetchSpotifyActivity(access_token);
          if (freshActivity && freshActivity.recently_played && freshActivity.recently_played.length > 0) {
            currentActivity = freshActivity;
            // Save it to profiles for caching
            await supabase
              .from('profiles')
              .update({ spotify_activity: freshActivity })
              .eq('id', user.id);
          }
        }
      } catch (err) {
        console.error("Failed to sync fresh Spotify activity:", err);
      }

      // 2. If live fetch failed, fallback to cached
      if (!currentActivity) {
        const { data } = await supabase
          .from('profiles')
          .select('spotify_activity')
          .eq('id', user.id)
          .single();

        if (data?.spotify_activity) {
          currentActivity = data.spotify_activity;
        }
      }

      if (currentActivity) {
        setActivity(currentActivity);
      }

      // Fetch user's reviews to see which tracks they've reviewed
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('spotify_album_id')
        .eq('user_id', user.id);
        
      if (reviewsData) {
        const trackIds = reviewsData
          .map(r => r.spotify_album_id)
          .filter(id => id && id.startsWith('track_'))
          .map(id => id.replace('track_', ''));
        setReviewedTracks(new Set(trackIds));
      }

      setLoading(false);
    };

    fetchHistory();
    
    // Auto-refresh every 5 seconds
    intervalId = setInterval(fetchHistory, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [navigate, user]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
      </div>
    );
  }

  if (!activity || !activity.recently_played || activity.recently_played.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 flex-1 w-full">
        <h1 className="text-3xl font-bold text-white mb-8">Rewind</h1>
        <div className="bg-[#141414] border border-[#27272a] rounded-xl p-12 text-center">
          <Music className="w-16 h-16 text-[#3f3f46] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No listening history found</h2>
          <p className="text-[#9ca3af] max-w-md mx-auto mb-6">
            We couldn't find any recently played tracks. Make sure you have connected your Spotify account in your profile settings.
          </p>
          <Link to="/settings" className="inline-flex px-6 py-3 bg-[#1db954] hover:bg-[#1aa34a] text-black font-bold rounded-full transition-colors">
            Connect Spotify
          </Link>
        </div>
      </div>
    );
  }

  // De-duplicate tracks by ID
  const uniqueTracks = activity.recently_played.reduce((acc, current) => {
    const x = acc.find(item => item.track.id === current.track.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 flex-1 w-full">
      <div className="flex items-center gap-3 mb-8">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#1db954]">
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
        </svg>
        <h1 className="text-3xl font-bold text-white">Rewind</h1>
      </div>

      <div className="bg-[#0a0a0a] rounded-xl">
        <h2 className="text-lg font-bold text-[#9ca3af] uppercase tracking-wider mb-6 px-2">Your Recent Tracks</h2>
        
        <div className="flex flex-col gap-4">
          {uniqueTracks.map((item, index) => {
            const track = item.track;
            const isReviewed = reviewedTracks.has(track.id);

            return (
              <div key={`${track.id}-${index}`} className="flex items-center gap-4 bg-[#141414] border border-[#27272a] rounded-xl p-4 hover:border-[#3f3f46] transition-colors group">
                <Link to={`/track/${track.id}`} className="flex-shrink-0 relative overflow-hidden rounded-md shadow-md">
                  <img 
                    src={track.album.images[0]?.url} 
                    alt={track.name}
                    className="w-16 h-16 md:w-20 md:h-20 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/track/${track.id}`}>
                    <h3 className="font-bold text-white text-base md:text-lg truncate hover:text-[#8b5cf6] transition-colors">{track.name}</h3>
                  </Link>
                  <p className="text-[#9ca3af] text-sm truncate">
                    {track.artists.map((a, i) => (
                      <React.Fragment key={a.id}>
                        <Link to={`/artist/${a.id}`} className="hover:text-white transition-colors">{a.name}</Link>
                        {i < track.artists.length - 1 && ', '}
                      </React.Fragment>
                    ))}
                  </p>
                </div>
                
                <div className="flex-shrink-0 ml-2 md:ml-4">
                  {isReviewed ? (
                     <div className="flex items-center gap-2 text-[#1db954] bg-[#1db954]/10 px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium border border-[#1db954]/20">
                       <CheckCircle className="w-4 h-4 hidden sm:block" />
                       <span className="hidden sm:inline">Reviewed</span>
                       <CheckCircle className="w-5 h-5 sm:hidden" />
                     </div>
                  ) : (
                     <Link 
                       to={`/write-review/track/${track.id}`}
                       className="flex items-center gap-2 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-3 py-2 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-bold transition-colors shadow-md"
                     >
                       <Edit3 className="w-4 h-4 hidden sm:block" />
                       <span className="hidden sm:inline">Write Review</span>
                       <span className="sm:hidden">Review</span>
                     </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
