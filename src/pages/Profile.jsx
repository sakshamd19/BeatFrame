import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ReviewCard from '../components/ReviewCard';
import { Loader2 } from 'lucide-react';

export default function Profile() {
  const { username } = useParams();
  
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const fetchProfileAndData = async () => {
      setLoading(true);
      setError(null);
      
      try {

        // 1. Fetch Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', username)
          .maybeSingle();

        if (profileError) {
          if (profileError.code === 'PGRST116') throw new Error('User not found');
          throw profileError;
        }
        
        setProfile(profileData);

        // 2. Fetch Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles ( username, avatar_url ),
            likes ( count )
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (reviewsError) throw reviewsError;
        
        const formattedReviews = reviewsData.map(r => ({
          ...r,
          likes_count: r.likes?.[0]?.count || 0
        }));
        setReviews(formattedReviews);

        // 3. Fetch Stats
        const { count: followersCount } = await supabase
          .from('followers')
          .select('id', { count: 'exact', head: true })
          .eq('following_id', profileData.id);

        const { count: followingCount } = await supabase
          .from('followers')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', profileData.id);

        setStats({
          followers: followersCount || 0,
          following: followingCount || 0
        });

      } catch (err) {
        console.error("Profile error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchProfileAndData();
    }
  }, [username]);

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
    </div>
  );

  if (error || !profile) return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center bg-[#0a0a0a]">
      <h1 className="text-6xl font-black text-white mb-4">404</h1>
      <h2 className="text-2xl font-bold text-[#94a3b8] mb-8">User Not Found</h2>
      <p className="text-[#64748b] max-w-md mb-8">The profile you're looking for doesn't exist.</p>
      <Link to="/explore" className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
        Return to Explore
      </Link>
    </div>
  );

  return (
    <div className="bg-background min-h-screen pt-24 sm:pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="bg-surface1 border border-white/5 rounded-2xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 shadow-2xl relative overflow-hidden group text-center md:text-left">
          {/* Subtle gradient orb behind avatar */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative z-10 flex-shrink-0">
            {profile.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.username} 
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover shadow-[0_0_30px_rgba(124,58,237,0.3)] border-4 border-surface2"
              />
            ) : (
              <div className="w-28 h-28 sm:w-36 sm:h-36 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-5xl font-display font-bold text-white shadow-[0_0_30px_rgba(124,58,237,0.3)] border-4 border-surface2">
                {(profile.full_name || profile.username).charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="flex-1 relative z-10 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                  {profile.full_name || profile.username}
                </h1>
                {profile.spotify_url && (
                  <a href={profile.spotify_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-[#1db954]/10 text-[#1db954] border border-[#1db954]/20 rounded-full hover:bg-[#1db954]/20 transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                    Spotify Linked
                  </a>
                )}
              </div>
              {currentUser?.id === profile.id && (
                <Link 
                  to="/settings" 
                  className="inline-flex items-center justify-center px-5 py-2.5 bg-surface2 border border-white/10 rounded-full text-sm font-bold text-white hover:bg-white/10 transition-colors"
                >
                  Edit Profile
                </Link>
              )}
            </div>
            <p className="gradient-text font-bold text-lg mb-4 text-center md:text-left">@{profile.username}</p>
            
            {profile.bio && (
              <p className="text-secondary text-lg mb-8 max-w-2xl leading-relaxed mx-auto md:mx-0">{profile.bio}</p>
            )}

            {/* Top Artists and Genres */}
            {(profile.favorite_genres?.length > 0 || profile.favorite_artists?.length > 0) && (
              <div className="bg-surface2/50 border border-white/5 rounded-xl p-6 mb-8 mt-4">
                {profile.favorite_genres?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-3">Top Genres</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.favorite_genres.map(genre => (
                        <span key={genre} className="px-3 py-1.5 rounded-full bg-surface2 text-white text-xs font-medium border border-white/10 hover:border-primary/50 transition-colors">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {profile.favorite_artists?.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-[#9ca3af] uppercase tracking-wider mb-3">Top Artists</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.favorite_artists.map(artist => (
                        <Link key={artist.id} to={`/search?q=${encodeURIComponent(artist.name)}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface2 text-white text-xs font-medium border border-white/10 hover:border-primary transition-colors group">
                          {artist.image && (
                            <img src={artist.image} alt={artist.name} className="w-5 h-5 rounded-full object-cover" />
                          )}
                          <span className="group-hover:text-primary transition-colors">{artist.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Listening Activity */}
            <div className="flex items-center justify-center md:justify-start gap-6 sm:gap-8 mt-8 border-t border-white/5 pt-6 md:border-t-0 md:pt-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{reviews.length}</div>
                <div className="text-sm text-[#6b7280] uppercase tracking-wider">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.followers}</div>
                <div className="text-sm text-[#6b7280] uppercase tracking-wider">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{stats.following}</div>
                <div className="text-sm text-[#6b7280] uppercase tracking-wider">Following</div>
              </div>
            </div>
          </div>
        </div>

        {/* User's Reviews */}
        <div className="mb-12">
          <h2 className="text-3xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">Recent Reviews</h2>
          
          {reviews.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-surface1 border border-white/5 rounded-xl shadow-lg">
              <p className="text-[#9ca3af] text-lg">@{profile.username} hasn't written any reviews yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
