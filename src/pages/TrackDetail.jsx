import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrack } from '../services/spotify';
import { supabase } from '../lib/supabase';
import ReviewCard from '../components/ReviewCard';
import SkeletonCard from '../components/SkeletonCard';
import { Play, Music, Headphones, Edit3 } from 'lucide-react';
import ReviewStats from '../components/ReviewStats';
import InlineReviewForm from '../components/InlineReviewForm';

export default function TrackDetail() {
  const { spotifyId } = useParams();
  const [track, setTrack] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingTrack, setLoadingTrack] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null);
  
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    const fetchTrackData = async () => {
      setLoadingTrack(true);
      setError(null);
      try {
        const trackData = await getTrack(spotifyId);
        setTrack(trackData);
      } catch (err) {
        setError("Couldn't load track details.");
      } finally {
        setLoadingTrack(false);
      }
    };

    // Define fetchReviews outside so it can be used for refresh
    if (spotifyId) {
      fetchTrackData();
      fetchReviews();
    }
  }, [spotifyId]);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const { data, error: dbError } = await supabase
        .from('reviews')
        .select('*, profiles (username, avatar_url), likes(count)')
        .eq('spotify_album_id', `track_${spotifyId}`)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      setReviews(data.map(r => ({ ...r, likes_count: r.likes?.[0]?.count || 0 })));
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'liked') {
      return b.likes_count - a.likes_count;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (error) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link to="/search" className="text-[#8b5cf6] hover:text-white">&larr; Back to Search</Link>
      </div>
    </div>
  );

  const formatDuration = (ms) => {
    if (!ms) return '0:00';
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <div className="bg-background min-h-screen pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        {loadingTrack ? (
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-pulse">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl bg-[#141414] border border-[#27272a] flex-shrink-0"></div>
            <div className="flex-1 py-4 w-full">
              <div className="h-10 bg-[#141414] rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-[#141414] rounded w-1/2 mb-4"></div>
              <div className="h-12 bg-[#141414] rounded w-40 mt-8"></div>
            </div>
          </div>
        ) : track && (
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left mb-12">
            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.15)] border border-white/5 relative group bg-surface1">
              {track.album?.images[0]?.url && (
                <img src={track.album.images[0].url} alt={track.name} className="w-full h-full object-cover" />
              )}
            </div>
            <div className="flex-1 flex flex-col xl:flex-row gap-8 justify-between w-full items-center md:items-start xl:items-center">
              <div className="flex flex-col justify-center min-h-[12rem] md:min-h-[16rem] py-2 flex-1 w-full">
                <span className="text-[#8b5cf6] uppercase tracking-wider font-bold text-sm mb-2">Track</span>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  {track.name}
                </h1>
                <p className="text-xl md:text-2xl text-[#9ca3af] mb-2 font-medium">
                  {track.artists?.map((a, i) => (
                    <React.Fragment key={a.id}>
                      <Link to={`/artist/${a.id}`} className="hover:text-white transition-colors">{a.name}</Link>
                      {i < track.artists.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </p>
                <Link to={`/album/${track.album?.id}`} className="text-[#6b7280] hover:text-[#8b5cf6] transition-colors mb-8 inline-block">
                  From the album {track.album?.name}
                </Link>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 w-full">
                  {track.external_urls?.spotify && (
                    <a 
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#1db954] hover:bg-[#1ed760] text-black rounded-md font-bold transition-colors shadow-lg shadow-[#1db954]/20 gap-2"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Listen on Spotify
                    </a>
                  )}

                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(track.name + ' ' + (track.artists?.[0]?.name || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#ff0000]/20 gap-2"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Listen on YouTube
                  </a>

                  <a 
                    href={`https://music.apple.com/search?term=${encodeURIComponent(track.name + ' ' + (track.artists?.[0]?.name || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#fa243c] hover:bg-[#e02036] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#fa243c]/20 gap-2"
                  >
                    <Music className="w-5 h-5" />
                    Listen on Apple Music
                  </a>

                  <a 
                    href={`https://music.amazon.com/search/${encodeURIComponent(track.name + ' ' + (track.artists?.[0]?.name || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#00a8e1] hover:bg-[#0096c9] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#00a8e1]/20 gap-2"
                  >
                    <Headphones className="w-5 h-5" />
                    Listen on Amazon Music
                  </a>

                  {track.preview_url && (
                    <audio controls src={track.preview_url} className="h-12 w-full sm:w-[260px] whitespace-nowrap rounded-md mt-2 md:mt-0" />
                  )}
                </div>
              </div>
              
              <div className="flex flex-col justify-center bg-surface1 p-6 rounded-2xl border border-white/5 shadow-xl w-full xl:w-72 flex-shrink-0 mt-4 xl:mt-0 text-left">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(124,58,237,0.8)]"></span>
                  Track Info
                </h3>
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[#9ca3af]">Released</span>
                    <span className="text-white font-medium">{track.album?.release_date}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-[#9ca3af]">Duration</span>
                    <span className="text-white font-medium">{formatDuration(track.duration_ms)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9ca3af]">Explicit</span>
                    <span className="text-white font-medium">{track.explicit ? 'Yes 🅴' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div>
          {reviews.length > 0 && <ReviewStats reviews={reviews} />}
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Reviews
                {!loadingReviews && (
                  <span className="text-sm font-normal text-[#9ca3af] bg-surface2 px-2 py-0.5 rounded-full">
                    {reviews.length}
                  </span>
                )}
              </h2>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#141414] border border-white/10 text-white rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#8b5cf6]"
              >
                <option value="recent">↓ Recent</option>
                <option value="liked">⇅ Most Liked</option>
              </select>
            </div>
          </div>
          
          {track && <InlineReviewForm item={track} type="track" onSuccess={fetchReviews} />}

          {loadingReviews ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : sortedReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {sortedReviews.map(review => <ReviewCard key={review.id} review={review} />)}
            </div>
          ) : (
            <div className="bg-surface1 border border-white/5 rounded-2xl p-8 text-center shadow-lg mt-8">
              <p className="text-[#9ca3af] text-lg">No reviews yet for this track.</p>
              <p className="text-[#6b7280] text-sm mt-2">Write a review above to be the first!</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
