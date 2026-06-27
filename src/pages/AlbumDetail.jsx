import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlbum } from '../services/spotify';
import { supabase } from '../lib/supabase';
import AlbumHeader from '../components/AlbumHeader';
import Tracklist from '../components/Tracklist';
import ReviewCard from '../components/ReviewCard';
import SkeletonCard from '../components/SkeletonCard';
import ReviewStats from '../components/ReviewStats';
import InlineReviewForm from '../components/InlineReviewForm';

export default function AlbumDetail() {
  const { spotifyId } = useParams();
  const [album, setAlbum] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingAlbum, setLoadingAlbum] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null);

  const [sortBy, setSortBy] = useState('recent');

  const fetchReviews = React.useCallback(async () => {
    setLoadingReviews(true);
    try {
      const { data, error: dbError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles ( username, avatar_url ),
          likes ( count )
        `)
        .eq('spotify_album_id', spotifyId)
        .order('created_at', { ascending: false });

      if (dbError) throw dbError;
      
      const formattedData = data.map(review => ({
        ...review,
        likes_count: review.likes?.[0]?.count || 0
      }));
      
      setReviews(formattedData);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  }, [spotifyId]);

  useEffect(() => {
    const fetchAlbumData = async () => {
      setLoadingAlbum(true);
      setError(null);
      try {
        const albumData = await getAlbum(spotifyId);
        setAlbum(albumData);
      } catch (err) {
        setError("Couldn't load album details. Please try again.");
      } finally {
        setLoadingAlbum(false);
      }
    };

    if (spotifyId) {
      fetchAlbumData();
      fetchReviews();
    }
  }, [spotifyId, fetchReviews]);

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'liked') {
      return b.likes_count - a.likes_count;
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/search" className="text-[#8b5cf6] hover:text-white transition-colors">
            &larr; Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {loadingAlbum ? (
          <div className="flex flex-col md:flex-row gap-8 items-start mb-12 animate-pulse">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-xl bg-[#141414] border border-[#27272a] flex-shrink-0"></div>
            <div className="flex-1 py-4 w-full">
              <div className="h-10 md:h-12 bg-[#141414] border border-[#27272a] rounded w-3/4 mb-4"></div>
              <div className="h-6 md:h-8 bg-[#141414] border border-[#27272a] rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-[#141414] border border-[#27272a] rounded w-1/4 mb-8"></div>
              <div className="h-12 bg-[#141414] border border-[#27272a] rounded w-40"></div>
            </div>
          </div>
        ) : (
          <AlbumHeader album={album} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Tracklist */}
          <div className="lg:col-span-1">
            {loadingAlbum ? (
              <div className="h-96 bg-[#141414] border border-[#27272a] rounded-xl animate-pulse"></div>
            ) : (
              <Tracklist tracks={album?.tracks?.items} />
            )}
          </div>

          {/* Right Column: Community Reviews */}
          <div className="lg:col-span-2">
            {reviews.length > 0 && <ReviewStats reviews={reviews} />}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
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
              <div className="relative group">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-[#141414] border border-white/5 text-white rounded-full pl-4 pr-10 py-1.5 text-sm font-medium focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6]/50 hover:bg-white/5 transition-all shadow-inner cursor-pointer"
                >
                  <option value="recent">Recent</option>
                  <option value="liked">Most Liked</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6b7280] group-hover:text-white transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              </div>
            </div>
            
            {album && <InlineReviewForm item={album} type="album" onSuccess={fetchReviews} />}
            
            {loadingReviews ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : sortedReviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                {sortedReviews.map(review => <ReviewCard key={review.id} review={review} />)}
              </div>
            ) : (
              <div className="bg-[#141414] border border-[#27272a] rounded-xl p-8 text-center mt-8">
                <p className="text-[#9ca3af] text-lg">No reviews yet for this album.</p>
                <p className="text-[#6b7280] text-sm mt-2">Write a review above to be the first!</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
