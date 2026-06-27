import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getNewReleases, getTrendingTracks, getRecommendations } from '../services/spotify';
import ReviewCard from '../components/ReviewCard';
import AlbumCard from '../components/AlbumCard';
import GradientText from '../components/ui/GradientText';
import WaveformDivider from '../components/ui/WaveformDivider';
import GlowBadge from '../components/ui/GlowBadge';
import { Disc3, Zap, Flame, ThumbsUp, SkipForward, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Explore() {
  const [newReleasesGlobal, setNewReleasesGlobal] = useState([]);
  const [newReleasesIndia, setNewReleasesIndia] = useState([]);
  const [allReviews, setAllReviews] = useState([]);
  const [trendingGlobal, setTrendingGlobal] = useState([]);
  const [trendingIndia, setTrendingIndia] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [spotifyLoading, setSpotifyLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);

  // Fast fetch: Supabase Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setReviewsLoading(true);
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`*, profiles ( username, avatar_url ), likes ( count )`)
          .order('created_at', { ascending: false })
          .limit(50);
          
        if (reviewsData) {
          setAllReviews(reviewsData.map(r => ({...r, likes_count: r.likes?.[0]?.count || 0})));
        }
      } catch (err) {
        console.error('Explore reviews fetch error:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Slow fetch: Spotify APIs
  useEffect(() => {
    const fetchSpotifyData = async () => {
      try {
        setSpotifyLoading(true);
        
        // 1. Fetch New Releases (Global and India)
        const [releasesGlobalData, releasesIndiaData] = await Promise.all([
          getNewReleases('US').catch(() => null),
          getNewReleases('IN').catch(() => null)
        ]);

        if (releasesGlobalData?.albums?.items) {
          setNewReleasesGlobal(releasesGlobalData.albums.items.slice(0, 5));
        }
        if (releasesIndiaData?.albums?.items) {
          setNewReleasesIndia(releasesIndiaData.albums.items.slice(0, 5));
        }

        // 2. Fetch Trending (Global and India)
        const [globalData, indiaData] = await Promise.all([
          getTrendingTracks('global').catch(() => null),
          getTrendingTracks('India').catch(() => null)
        ]);

        if (globalData?.items) {
          setTrendingGlobal(globalData.items.map(item => item.track).filter(Boolean));
        }
        if (indiaData?.items) {
          setTrendingIndia(indiaData.items.map(item => item.track).filter(Boolean));
        }
      } catch (err) {
        console.error('Explore spotify fetch error:', err);
      } finally {
        setSpotifyLoading(false);
      }
    };
    fetchSpotifyData();
  }, []);

  // Fetch Personalized Recommendations
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user) return;
      
      try {
        setRecsLoading(true);
        // 1. Get recent review tracks for seed
        const { data: userReviews } = await supabase
          .from('reviews')
          .select('spotify_album_id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
          
        let seed_tracks = [];
        if (userReviews) {
          const trackReviews = userReviews.filter(r => r.spotify_album_id?.startsWith('track_'));
          seed_tracks = trackReviews.map(r => r.spotify_album_id.replace('track_', '')).slice(0, 2);
        }

        let seed_artists = [];
        if (profile?.favorite_artists?.length > 0) {
          seed_artists = profile.favorite_artists.slice(0, 2).map(a => a.id);
        }

        let seed_genres = [];
        
        // Skip if no seeds
        if (seed_tracks.length === 0 && seed_artists.length === 0 && seed_genres.length === 0) {
          return;
        }

        const data = await getRecommendations({ seed_artists, seed_genres, seed_tracks, limit: 10 });
        if (data?.tracks) {
          const uniqueAlbums = [];
          const seenAlbums = new Set();
          for (const track of data.tracks) {
            if (!seenAlbums.has(track.album.id)) {
              seenAlbums.add(track.album.id);
              uniqueAlbums.push(track.album);
            }
          }
          setRecommendations(uniqueAlbums);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      } finally {
        setRecsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [user, profile]);

  const filters = ['All', 'Bangers', 'Fire', 'Decent', 'Skip'];

  const filteredReviews = allReviews.filter(review => {
    if (filter === 'All') return true;
    if (filter === 'Bangers') return review.rating?.toLowerCase() === 'banger';
    return review.rating?.toLowerCase() === filter.toLowerCase();
  });



  return (
    <div className="pb-24 pt-24 sm:pt-32 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in-up">
          <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-7xl mb-6 tracking-tight">
            What <GradientText>BeatFrame</GradientText> is Hearing
          </h1>
          <p className="text-lg text-[#94a3b8] font-medium max-w-2xl mx-auto">
            Discover the latest drops, read passionate reviews, and find your next favorite track through the ears of our community.
          </p>
        </div>

        {/* Global Fresh Drops Banner */}
        {spotifyLoading ? (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse"></div>
              <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : newReleasesGlobal.length > 0 && (
          <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Disc3 className="w-6 h-6 text-secondary animate-[spin_4s_linear_infinite]" />
              <h2 className="font-display font-bold text-2xl text-white">Global Fresh Drops</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              {newReleasesGlobal.map(album => (
                <Link key={album.id} to={`/album/${album.id}`} className="group relative block rounded-xl overflow-hidden aspect-square">
                  <img src={album.images[0]?.url} alt={album.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-4 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-white text-sm truncate">{album.name}</h3>
                    <p className="text-secondary text-xs truncate mt-1">{album.artists[0]?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* India Fresh Drops Banner */}
        {spotifyLoading ? (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 rounded-full bg-white/5 animate-pulse"></div>
              <div className="h-8 w-48 bg-white/5 rounded-lg animate-pulse"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-white/5 animate-pulse"></div>
              ))}
            </div>
            <WaveformDivider className="mt-12 opacity-50" />
          </div>
        ) : newReleasesIndia.length > 0 && (
          <div className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Disc3 className="w-6 h-6 text-secondary animate-[spin_4s_linear_infinite]" />
              <h2 className="font-display font-bold text-2xl text-white">Fresh Drops in India</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
              {newReleasesIndia.map(album => (
                <Link key={album.id} to={`/album/${album.id}`} className="group relative block rounded-xl overflow-hidden aspect-square">
                  <img src={album.images[0]?.url} alt={album.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-4 w-full translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-white text-sm truncate">{album.name}</h3>
                    <p className="text-secondary text-xs truncate mt-1">{album.artists[0]?.name}</p>
                  </div>
                </Link>
              ))}
            </div>
            <WaveformDivider className="mt-12 opacity-50" />
          </div>
        )}

        {/* Recommended For You Section */}
        {user && (
          <div className="mb-20 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <Sparkles className="w-6 h-6 text-secondary" />
              <h2 className="font-display font-bold text-2xl text-white">Recommended For You</h2>
            </div>
            
            {recommendations.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {recommendations.slice(0, 5).map((album, i) => (
                  <div key={album.id} style={{ animationDelay: `${i * 0.1}s` }} className="animate-fade-in-up">
                    <AlbumCard album={album} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center bg-surface1/50 rounded-xl border border-white/5">
                <p className="text-[#94a3b8] font-medium mb-4">We need a little more info to make recommendations.</p>
                <Link to="/settings" className="text-primary hover:text-white transition-colors text-sm font-bold">
                  Add Favorite Artists to Profile →
                </Link>
              </div>
            )}
            <WaveformDivider className="mt-12 opacity-50" />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Feed */}
          <div className="lg:col-span-8">
            
            {/* Filter Pills */}
            <div className="sticky top-20 z-40 py-4 mb-10 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="inline-flex flex-wrap sm:flex-nowrap items-center bg-[#141414] rounded-3xl sm:rounded-full p-1.5 border border-white/5 shadow-inner gap-1 max-w-full overflow-x-auto scrollbar-hide">
                {filters.map(f => {
                  const filterColors = {
                    'All': 'bg-gradient-to-r from-primary to-secondary text-white shadow-md scale-[1.02]',
                    'Bangers': 'bg-[#8b5cf6] text-white shadow-md scale-[1.02]',
                    'Fire': 'bg-[#f97316] text-white shadow-md scale-[1.02]',
                    'Decent': 'bg-[#3b82f6] text-white shadow-md scale-[1.02]',
                    'Skip': 'bg-[#6b7280] text-white shadow-md scale-[1.02]',
                  };
                  return (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 border border-transparent whitespace-nowrap ${
                        filter === f 
                          ? filterColors[f] 
                          : 'text-[#6b7280] hover:text-white hover:bg-white/5'
                      }`}
                    >
                    {f === 'Bangers' && <Flame className="w-4 h-4" />}
                    {f === 'Fire' && <Zap className="w-4 h-4" />}
                    {f === 'Decent' && <ThumbsUp className="w-4 h-4" />}
                    {f === 'Skip' && <SkipForward className="w-4 h-4" />}
                    <span>{f === 'All' ? 'All Reviews' : f}</span>
                  </button>
                )})}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {reviewsLoading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-48 bg-surface1 border border-white/5 rounded-2xl animate-pulse"></div>
                ))
              ) : allReviews.length === 0 ? (
                <div className="py-20 text-center bg-surface1 gradient-border-1px rounded-2xl animate-fade-in-up">
                  <p className="text-white font-bold text-xl mb-2">No reviews yet!</p>
                  <p className="text-[#94a3b8] font-medium mb-6">Be the first to share your music taste.</p>
                  <Link to="/search" className="px-6 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-full font-bold transition-colors">
                    Search Music
                  </Link>
                </div>
              ) : filteredReviews.length > 0 ? (
                filteredReviews.map((review, i) => (
                  <div key={review.id} style={{ animationDelay: `${i * 0.1}s` }}>
                    <ReviewCard review={review} />
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-surface1 gradient-border-1px rounded-2xl animate-fade-in-up">
                  <p className="text-[#94a3b8] font-medium">No reviews found matching this filter.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 bg-surface1 p-6 rounded-2xl border border-white/5 shadow-2xl animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              {/* Trending Globally */}
              <div className="flex items-center gap-3 mb-8">
                <Zap className="w-6 h-6 text-banger fill-banger" />
                <h2 className="font-display font-bold text-2xl text-white">Trending Globally</h2>
              </div>
              
              <div className="flex flex-col gap-6 mb-12">
                {spotifyLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white/5 rounded animate-pulse"></div>
                      <div className="w-14 h-14 bg-white/5 rounded-md animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : trendingGlobal.map((track, index) => {
                  return (
                    <Link key={track.id} to={`/track/${track.id}`} className="group flex items-center gap-4">
                      <span className="font-display font-bold text-4xl text-white/10 group-hover:text-primary/50 transition-colors">
                        0{index + 1}
                      </span>
                      <img src={track.album?.images[0]?.url} alt={track.name} className="w-14 h-14 rounded-md object-cover shadow-lg border border-white/10 group-hover:border-secondary transition-colors" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-secondary transition-colors">{track.name}</h4>
                        <p className="text-[#94a3b8] text-xs truncate mt-0.5">{track.artists?.[0]?.name}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Trending in India */}
              <div className="flex items-center gap-3 mb-8">
                <Zap className="w-6 h-6 text-banger fill-banger" />
                <h2 className="font-display font-bold text-2xl text-white">Trending in India</h2>
              </div>
              
              <div className="flex flex-col gap-6">
                {spotifyLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-white/5 rounded animate-pulse"></div>
                      <div className="w-14 h-14 bg-white/5 rounded-md animate-pulse"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/5 rounded w-3/4 animate-pulse"></div>
                        <div className="h-3 bg-white/5 rounded w-1/2 animate-pulse"></div>
                      </div>
                    </div>
                  ))
                ) : trendingIndia.map((track, index) => {
                  return (
                    <Link key={track.id} to={`/track/${track.id}`} className="group flex items-center gap-4">
                      <span className="font-display font-bold text-4xl text-white/10 group-hover:text-primary/50 transition-colors">
                        0{index + 1}
                      </span>
                      <img src={track.album?.images[0]?.url} alt={track.name} className="w-14 h-14 rounded-md object-cover shadow-lg border border-white/10 group-hover:border-secondary transition-colors" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white text-sm truncate group-hover:text-secondary transition-colors">{track.name}</h4>
                        <p className="text-[#94a3b8] text-xs truncate mt-0.5">{track.artists?.[0]?.name}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
