import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAlbum, getTrack } from '../services/spotify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react';

export default function WriteReview() {
  const { type, spotifyId } = useParams(); // type is 'album' or 'track'
  const navigate = useNavigate();
  
  const [item, setItem] = useState(null);
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {

      try {
        const itemPrefix = type === 'track' ? `track_${spotifyId}` : spotifyId;
        
        // 1. Check if review already exists
        const { data: existingReview } = await supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id)
          .eq('spotify_album_id', itemPrefix)
          .single();

        if (existingReview) {
          navigate(`/edit-review/${existingReview.id}`);
          return;
        }

        // 2. Fetch Item Data
        if (type === 'track') {
          const trackData = await getTrack(spotifyId);
          setItem(trackData);
        } else {
          const albumData = await getAlbum(spotifyId);
          setItem(albumData);
        }
      } catch (err) {
        setError("Failed to load details.");
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [type, spotifyId, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const isTrack = type === 'track';
    
    const insertData = {
      user_id: user.id,
      spotify_album_id: isTrack ? `track_${item.id}` : item.id,
      album_name: item.name,
      album_artist: item.artists.map(a => a.name).join(', '),
      album_cover_url: isTrack ? item.album.images[0]?.url : item.images[0]?.url,
      rating: rating,
      review_text: reviewText
    };

    try {
      const { error: insertError } = await supabase
        .from('reviews')
        .insert(insertData);

      if (insertError) throw insertError;
      
      setSuccess(true);
      setTimeout(() => {
        navigate(isTrack ? `/track/${item.id}` : `/album/${item.id}`);
      }, 1500);
    } catch (err) {
      console.error('Submit error:', err);
      if (err.message.includes('unique constraint') || err.code === '23505') {
         setError('You have already reviewed this item.');
      } else {
         setError(err.message || 'Failed to submit review');
      }
      setSubmitting(false);
    }
  };

  const ratings = [
    { value: 'banger', label: 'Banger', color: 'bg-[#8b5cf6]', border: 'border-[#8b5cf6]' },
    { value: 'fire', label: 'Fire', color: 'bg-[#f97316]', border: 'border-[#f97316]' },
    { value: 'decent', label: 'Decent', color: 'bg-[#3b82f6]', border: 'border-[#3b82f6]' },
    { value: 'skip', label: 'Skip', color: 'bg-[#6b7280]', border: 'border-[#6b7280]' }
  ];

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
    </div>
  );

  if (error && !item) return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#0a0a0a]">
      <p className="text-red-400 mb-4">{error}</p>
      <Link to="/search" className="text-[#8b5cf6] hover:text-white">Return to Search</Link>
    </div>
  );

  const isTrack = type === 'track';
  const displayTitle = isTrack ? item.name : item.name;
  const displayArtist = isTrack ? item.artists.map(a => a.name).join(', ') : item.artists.map(a => a.name).join(', ');
  const displayCover = isTrack ? item.album.images[0]?.url : item.images[0]?.url;

  return (
    <div className="bg-background min-h-screen pt-32 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-white mb-8">Write a Review</h1>

        {/* Context */}
        <div className="flex gap-6 p-6 bg-[#141414] rounded-xl border border-[#27272a] mb-8">
          <img 
            src={displayCover || 'https://via.placeholder.com/80'} 
            alt={displayTitle} 
            className="w-24 h-24 rounded-md shadow-md"
          />
          <div className="flex flex-col justify-center">
            <span className="text-[#8b5cf6] text-xs font-bold uppercase tracking-wider mb-1">
              {isTrack ? 'Track' : 'Album'}
            </span>
            <h2 className="text-2xl font-bold text-white mb-1">{displayTitle}</h2>
            <p className="text-[#9ca3af]">{displayArtist}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-md">
              {error}
            </div>
          )}

          {/* Rating Selection */}
          <div>
            <label className="block text-sm font-medium text-[#9ca3af] mb-4">
              Your Rating (Required)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {ratings.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRating(r.value)}
                  className={`
                    py-3 rounded-lg font-bold transition-all border-2
                    ${rating === r.value 
                      ? `${r.color} border-transparent text-white scale-105 shadow-lg` 
                      : `bg-[#141414] ${r.border} text-[#9ca3af] hover:text-white hover:scale-105`}
                  `}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-[#9ca3af] mb-2">
              Your Review (Optional)
            </label>
            <textarea
              id="review"
              rows={6}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder={`What did you think of this ${isTrack ? 'track' : 'album'}?`}
              className="block w-full p-4 bg-[#141414] border-2 border-[#27272a] rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-[#8b5cf6] focus:ring-1 focus:ring-[#8b5cf6] resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link 
              to={isTrack ? `/track/${item.id}` : `/album/${item.id}`}
              className="px-6 py-3 text-[#9ca3af] hover:text-white font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting || success}
              className={`px-8 py-3 rounded-md font-medium transition-colors shadow-lg flex items-center justify-center min-w-[140px]
                ${success ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-[#8b5cf6]/20 disabled:opacity-50'}
              `}
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 
               success ? <><CheckCircle className="w-5 h-5 mr-2" /> Posted!</> : 
               'Post Review'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
