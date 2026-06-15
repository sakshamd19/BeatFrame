import React from 'react';
import { Link } from 'react-router-dom';

export default function TrackRow({ track, index }) {
  if (!track) return null;
  const artistName = track.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
  const albumName = track.album?.name || 'Single';
  const albumId = track.album?.id;
  const imageUrl = track.album?.images?.[track.album.images.length - 1]?.url || 'https://via.placeholder.com/40';

  // Format ms to m:ss
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  const Content = () => (
    <div className="flex items-center gap-4 p-3 bg-[#141414] border-b border-[#27272a] hover:bg-[#1a1a1a] transition-colors group">
      <div className="text-[#6b7280] w-6 text-right text-sm">{index + 1}</div>
      <img src={imageUrl} alt={albumName} className="w-10 h-10 rounded shadow-sm" loading="lazy" />
      <div className="flex-1 min-w-0">
        <div className="text-white font-medium truncate group-hover:text-[#8b5cf6] transition-colors">
          {track.name}
        </div>
        <div className="text-[#9ca3af] text-sm truncate flex gap-2">
          <span>{artistName}</span>
          <span className="hidden sm:inline text-[#6b7280]">•</span>
          <span className="hidden sm:inline truncate">{albumName}</span>
        </div>
      </div>
      <div className="text-[#9ca3af] text-sm font-mono tracking-tighter w-12 text-right">
        {formatDuration(track.duration_ms)}
      </div>
    </div>
  );

  return track.id ? (
    <Link to={`/track/${track.id}`} className="block">
      <Content />
    </Link>
  ) : (
    <Content />
  );
}
