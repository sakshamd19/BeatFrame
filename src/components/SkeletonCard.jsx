import React from 'react';

export default function SkeletonCard() {
  return (
    <div className="bg-[#141414] border border-[#27272a] rounded-xl p-4 h-full flex flex-col animate-pulse">
      {/* User Info Skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#27272a]"></div>
        <div className="flex-1">
          <div className="h-4 bg-[#27272a] rounded w-24 mb-2"></div>
          <div className="h-3 bg-[#27272a] rounded w-16"></div>
        </div>
      </div>

      {/* Album Info Skeleton */}
      <div className="flex gap-4 mb-4">
        <div className="w-20 h-20 rounded-md bg-[#27272a]"></div>
        <div className="flex-1 py-1">
          <div className="h-5 bg-[#27272a] rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-[#27272a] rounded w-1/2 mb-3"></div>
          <div className="h-6 bg-[#27272a] rounded-full w-16"></div>
        </div>
      </div>

      {/* Review Text Skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-[#27272a] rounded w-full"></div>
        <div className="h-3 bg-[#27272a] rounded w-5/6"></div>
        <div className="h-3 bg-[#27272a] rounded w-4/6"></div>
      </div>

      {/* Action Bar Skeleton */}
      <div className="mt-4 pt-3 border-t border-[#27272a] flex items-center">
        <div className="w-8 h-4 bg-[#27272a] rounded"></div>
      </div>
    </div>
  );
}
