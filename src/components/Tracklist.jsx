import React from 'react';
import { Link } from 'react-router-dom';

export default function Tracklist({ tracks }) {
  if (!tracks || tracks.length === 0) return null;

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  return (
    <div className="bg-[#141414] border border-[#27272a] rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-[#27272a] bg-[#1a1a1a]">
        <h2 className="text-sm font-bold text-[#9ca3af] uppercase tracking-wider">Tracklist</h2>
      </div>
      <div className="divide-y divide-[#27272a]">
        {tracks.map((track, i) => (
          <Link to={`/track/${track.id}`} key={track.id} className="flex items-center px-4 py-3 hover:bg-[#1a1a1a] even:bg-white/[0.02] transition-colors group">
            <span className="w-8 text-sm text-[#6b7280] font-mono">{i + 1}</span>
            <span className="flex-1 text-white text-sm font-medium group-hover:text-[#8b5cf6] transition-colors truncate pr-4">
              {track.name}
            </span>
            <span className="text-sm text-[#6b7280] font-mono group-hover:text-white transition-colors">
              {formatDuration(track.duration_ms)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
