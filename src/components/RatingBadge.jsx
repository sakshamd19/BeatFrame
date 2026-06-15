import React from 'react';

export default function RatingBadge({ rating }) {
  const getBadgeStyle = (r) => {
    switch (r?.toLowerCase()) {
      case 'banger':
        return 'bg-[#8b5cf6] text-white border-[#8b5cf6]';
      case 'fire':
        return 'bg-[#f97316] text-white border-[#f97316]';
      case 'decent':
        return 'bg-[#3b82f6] text-white border-[#3b82f6]';
      case 'skip':
        return 'bg-[#6b7280] text-white border-[#6b7280]';
      default:
        return 'bg-transparent text-[#9ca3af] border-[#27272a]';
    }
  };

  const getLabel = (r) => {
    if (!r) return 'Unrated';
    return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getBadgeStyle(rating)}`}>
      {getLabel(rating)}
    </span>
  );
}
