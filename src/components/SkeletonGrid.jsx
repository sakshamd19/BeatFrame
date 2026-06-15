import React from 'react';

export default function SkeletonGrid({ type = 'album', count = 8 }) {
  const renderAlbumSkeleton = (key) => (
    <div key={key} className="bg-[#141414] p-3 rounded-lg border border-[#27272a] animate-pulse">
      <div className="aspect-square w-full rounded-md mb-3 bg-[#1a1a1a]">
        <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
      </div>
      <div className="h-4 bg-[#2a2a2a] rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-[#2a2a2a] rounded w-1/2 mb-2"></div>
      <div className="h-2 bg-[#2a2a2a] rounded w-1/4 mt-2"></div>
    </div>
  );

  const renderArtistSkeleton = (key) => (
    <div key={key} className="flex flex-col items-center p-3 animate-pulse">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[#1a1a1a] mb-3 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
      </div>
      <div className="h-4 bg-[#2a2a2a] rounded w-24"></div>
    </div>
  );

  const renderTrackSkeleton = (key) => (
    <div key={key} className="flex items-center gap-4 p-3 bg-[#141414] border-b border-[#27272a] animate-pulse">
      <div className="w-6 h-4 bg-[#2a2a2a] rounded"></div>
      <div className="w-10 h-10 rounded bg-[#1a1a1a] overflow-hidden">
        <div className="w-full h-full bg-gradient-to-r from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] bg-[length:200%_100%] animate-[shimmer_1.5s_infinite]"></div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#2a2a2a] rounded w-1/3"></div>
        <div className="h-3 bg-[#2a2a2a] rounded w-1/4"></div>
      </div>
      <div className="w-10 h-4 bg-[#2a2a2a] rounded"></div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      
      {type === 'album' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: count }).map((_, i) => renderAlbumSkeleton(i))}
        </div>
      )}
      
      {type === 'artist' && (
        <div className="flex flex-wrap justify-center gap-6">
          {Array.from({ length: count / 2 }).map((_, i) => renderArtistSkeleton(i))}
        </div>
      )}
      
      {type === 'track' && (
        <div className="flex flex-col border border-[#27272a] rounded-lg overflow-hidden">
          {Array.from({ length: count }).map((_, i) => renderTrackSkeleton(i))}
        </div>
      )}
    </>
  );
}
