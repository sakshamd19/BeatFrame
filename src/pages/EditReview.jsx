import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function EditReview() {
  const { reviewId } = useParams();
  const navigate = useNavigate();
  
  const [review, setReview] = useState(null);
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {

      try {
        const { data: reviewData, error: reviewError } = await supabase
          .from('reviews')
          .select('*')
          .eq('id', reviewId)
          .single();

        if (reviewError) throw reviewError;
        
        if (reviewData.user_id !== user?.id) {
            throw new Error("You do not have permission to edit this review.");
        }

        setReview(reviewData);
        setRating(reviewData.rating || '');
        setReviewText(reviewData.review_text || '');
        
      } catch (err) {
        setError(err.message || "Failed to load details.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [reviewId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('reviews')
        .update({
            rating: rating,
            review_text: reviewText
        })
        .eq('id', reviewId);

      if (updateError) throw updateError;
      
      navigate(-1);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to update review');
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );

  if (error && !review) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <p className="text-red-400 mb-4">{error}</p>
      <Link to="/explore" className="text-primary hover:text-white">Return to Explore</Link>
    </div>
  );

  const isTrack = review.spotify_album_id && review.spotify_album_id.startsWith('track_');

  return (
    <div className="bg-background min-h-screen pt-32 pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-white mb-8">Edit Your Review</h1>

        {/* Context */}
        <div className="flex gap-6 p-6 bg-surface1 rounded-xl border border-white/5 mb-8">
          <img 
            src={review.album_cover_url || 'https://via.placeholder.com/80'} 
            alt={review.album_name} 
            className="w-24 h-24 rounded-md shadow-md object-cover"
          />
          <div className="flex flex-col justify-center">
            <span className="text-primary text-xs font-bold uppercase tracking-wider mb-1">
              {isTrack ? 'Track' : 'Album'}
            </span>
            <h2 className="text-2xl font-bold text-white mb-1">{review.album_name}</h2>
            <p className="text-[#9ca3af]">{review.album_artist}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {error && (
            <div className="bg-red-900/30 border border-red-500/50 text-red-200 p-4 rounded-md">
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
                      ? `${r.color} border-transparent text-white scale-105 shadow-[0_0_15px_rgba(124,58,237,0.4)]` 
                      : `bg-surface1 ${r.border} text-[#9ca3af] hover:text-white hover:scale-105 hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]`}
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
              placeholder="What did you think?"
              className="block w-full p-4 bg-surface1 border-2 border-white/5 rounded-xl text-white placeholder-[#6b7280] focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary resize-none transition-colors"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 text-[#9ca3af] hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] disabled:opacity-50 flex items-center justify-center min-w-[140px]"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
