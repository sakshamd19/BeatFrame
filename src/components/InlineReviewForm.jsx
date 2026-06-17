import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function InlineReviewForm({ item, type, onSuccess }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!user || !profile) {
    return (
      <div className="bg-[#141414] rounded-2xl p-6 border border-white/5 shadow-lg mb-8 text-center">
        <p className="text-[#9ca3af] mb-4">Please log in to write a review.</p>
      </div>
    );
  }

  const ratings = [
    { id: 'skip', label: 'Skip', hoverClass: 'hover:text-[#6b7280]', activeClass: 'bg-[#6b7280] text-white' },
    { id: 'decent', label: 'Decent', hoverClass: 'hover:text-[#3b82f6]', activeClass: 'bg-[#3b82f6] text-white' },
    { id: 'fire', label: 'Fire', hoverClass: 'hover:text-[#f97316]', activeClass: 'bg-[#f97316] text-white' },
    { id: 'banger', label: 'Banger', hoverClass: 'hover:text-[#8b5cf6]', activeClass: 'bg-[#8b5cf6] text-white' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError("Please select a rating category.");
      return;
    }

    if (reviewText && reviewText.length > 1000) {
      setError("Review cannot exceed 1000 characters.");
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
      
      setReviewText('');
      setRating('');
      if (onSuccess) onSuccess();
      
    } catch (err) {
      console.error('Submit error:', err);
      if (err.message.includes('unique constraint') || err.code === '23505') {
         setError('You have already reviewed this item. Edit it from your profile.');
      } else {
         setError(err.message || 'Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#141414] rounded-2xl p-6 border border-white/5 shadow-lg mb-8">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-md mb-4 text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            <img 
              src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
              alt={profile.username}
              className="w-10 h-10 rounded-full border border-white/10"
            />
            <span className="text-white font-medium">@{profile.username}</span>
          </div>

          {/* Rating Toggle */}
          <div className="flex items-center bg-[#1f2937] rounded-full p-1 border border-white/5">
            {ratings.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRating(r.id)}
                className={`
                  px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                  ${rating === r.id ? r.activeClass : `text-[#9ca3af] ${r.hoverClass}`}
                `}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Write your review here..."
          maxLength={1000}
          className="w-full bg-transparent border-b border-white/10 text-white placeholder-[#6b7280] p-0 pb-2 mb-2 focus:ring-0 focus:border-[#8b5cf6] resize-none outline-none"
          rows={3}
        />
        
        {/* Footer */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[#6b7280]">{reviewText.length}/1000</span>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
