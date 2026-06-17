import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAlbum } from '../services/spotify';
import { supabase } from '../lib/supabase';
import AlbumHeader from '../components/AlbumHeader';
import Tracklist from '../components/Tracklist';
import ReviewCard from '../components/ReviewCard';
import SkeletonCard from '../components/SkeletonCard';
import { Edit3 } from 'lucide-react';

export default function AlbumDetail() {
  const { spotifyId } = useParams();
  const [album, setAlbum] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loadingAlbum, setLoadingAlbum] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [error, setError] = useState(null);

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

    const fetchReviews = async () => {
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
    };

    if (spotifyId) {
      fetchAlbumData();
      fetchReviews();
    }
  }, [spotifyId]);

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Community Reviews</h2>
                {!loadingReviews && (
                  <span className="text-[#9ca3af] text-sm">{reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
                )}
              </div>
              <Link 
                to={`/write-review/album/${spotifyId}`}
                className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-auto sm:px-8 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#8b5cf6]/20 gap-2"
              >
                <Edit3 className="w-5 h-5" />
                Write a Review
              </Link>
            </div>
            
            {loadingReviews ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : reviews.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
              </div>
            ) : (
              <div className="bg-[#141414] border border-[#27272a] rounded-xl p-8 text-center">
                <p className="text-[#9ca3af] mb-4">No reviews yet for this album.</p>
                <Link 
                  to={`/write-review/album/${spotifyId}`}
                  className="text-[#8b5cf6] hover:text-white font-medium transition-colors"
                >
                  Be the first to review it!
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
