import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Heart, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import GlowBadge from './ui/GlowBadge';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function ReviewCard({ review }) {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [deleted, setDeleted] = useState(false);
  const [likesCount, setLikesCount] = useState(review.likes_count || 0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      if (!currentUser) return;
      const { data } = await supabase
        .from('likes')
        .select('id')
        .eq('review_id', review.id)
        .eq('user_id', currentUser.id)
        .maybeSingle();
      setIsLiked(!!data);
    };
    checkLike();
  }, [currentUser, review.id]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert('Please log in to like a review.');
      return;
    }

    try {
      if (isLiked) {
        setLikesCount(prev => prev - 1);
        setIsLiked(false);
        await supabase
          .from('likes')
          .delete()
          .eq('review_id', review.id)
          .eq('user_id', currentUser.id);
      } else {
        setLikesCount(prev => prev + 1);
        setIsLiked(true);
        await supabase
          .from('likes')
          .insert({ review_id: review.id, user_id: currentUser.id });
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        // 1. Try to delete associated likes first (in case of foreign key constraint without CASCADE)
        await supabase.from('likes').delete().eq('review_id', review.id);

        // 2. Delete the review and return the deleted row to verify it worked
        const { data, error } = await supabase
          .from('reviews')
          .delete()
          .eq('id', review.id)
          .select();
        
        if (error) {
          throw new Error(error.message || "Failed to delete from database.");
        }
        
        if (!data || data.length === 0) {
          throw new Error("Database rejected the deletion. You are missing a DELETE policy in your Supabase 'reviews' table.");
        }
        
        setDeleted(true);
      } catch (err) {
        console.error("Error deleting review:", err);
        alert(`Failed to delete: ${err.message}. If this persists, please check Supabase RLS policies.`);
      }
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/edit-review/${review.id}`);
  };

  const {
    id,
    user_id,
    spotify_album_id,
    spotify_track_id,
    album_name,
    track_name,
    album_artist,
    album_cover_url,
    rating,
    review_text,
    created_at,
    profiles
  } = review;

  if (deleted) return null;
  const isAuthor = currentUser?.id === user_id;

  const isTrack = spotify_album_id && spotify_album_id.startsWith('track_');
  const realId = isTrack ? spotify_album_id.replace('track_', '') : spotify_album_id;
  const itemUrl = isTrack ? `/track/${realId}` : `/album/${realId}`;
  const displayTitle = album_name;
  
  const timeAgo = created_at ? formatDistanceToNow(new Date(created_at), { addSuffix: true }) : '';

  return (
    <Link to={itemUrl} className="block group animate-fade-in-up">
      <div className="bg-surface1 gradient-border-1px p-4 sm:p-5 flex flex-col sm:flex-row gap-5 h-full hover:-translate-y-1 transition-transform duration-300">
        
        {/* Left Side: Artwork */}
        <div className="relative w-full sm:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden group-hover:shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-shadow duration-500">
          <img 
            src={album_cover_url || 'https://via.placeholder.com/150'} 
            alt={displayTitle} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Subtle Vinyl overlay effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] opacity-50 mix-blend-multiply pointer-events-none"></div>
          {isTrack && (
            <div className="absolute top-2 left-2 bg-[#050508]/80 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">
              Single
            </div>
          )}
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 min-w-0 flex flex-col">
          
          {/* Title & Badge Row */}
          <div className="flex items-start justify-between gap-3 mb-1">
            <h3 className="font-display font-bold text-xl text-white truncate group-hover:gradient-text transition-colors" title={displayTitle}>
              {displayTitle}
            </h3>
            <GlowBadge rating={rating} className="flex-shrink-0" />
          </div>
          
          <p className="text-secondary font-medium text-sm mb-3 truncate">
            {album_artist}
          </p>

          <p className="text-[#94a3b8] text-sm line-clamp-2 sm:line-clamp-3 flex-1 mb-4">
            {review_text ? `"${review_text}"` : <span className="italic opacity-50">No written review...</span>}
          </p>

          {/* Bottom Action Bar */}
          <div className="flex flex-wrap items-center justify-between mt-auto pt-3 border-t border-white/5 gap-y-3 gap-x-2">
            <Link to={`/profile/${profiles?.username}`} className="flex items-center gap-2 group/user z-10 min-w-0 flex-1" onClick={(e) => e.stopPropagation()}>
              {profiles?.avatar_url ? (
                <img src={profiles.avatar_url} alt={profiles.username} className="w-6 h-6 rounded-full object-cover border border-white/10 group-hover/user:border-primary transition-colors flex-shrink-0" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-surface2 flex items-center justify-center border border-white/10 flex-shrink-0">
                  <UserIcon className="w-3 h-3 text-[#94a3b8]" />
                </div>
              )}
              <span className="text-xs font-medium text-white group-hover/user:text-primary transition-colors truncate">
                {profiles?.username || 'Anonymous'}
              </span>
              <span className="text-xs text-[#475569] whitespace-nowrap flex-shrink-0">• {timeAgo}</span>
            </Link>

            <div className="flex items-center gap-3 z-10 flex-shrink-0">
              {isAuthor && (
                <div className="flex items-center gap-2 mr-2">
                  <button onClick={handleEdit} className="p-1.5 text-[#94a3b8] hover:text-primary transition-colors rounded-full hover:bg-white/5" title="Edit Review">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={handleDelete} className="p-1.5 text-[#94a3b8] hover:text-red-400 transition-colors rounded-full hover:bg-red-500/10" title="Delete Review">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors p-1.5 rounded-full ${isLiked ? 'text-banger' : 'text-[#94a3b8] hover:text-banger hover:bg-white/5'}`}>
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-banger' : ''}`} />
                <span className="text-xs font-bold">{likesCount}</span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </Link>
  );
}
