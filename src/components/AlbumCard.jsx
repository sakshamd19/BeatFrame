import React from 'react';
import { Link } from 'react-router-dom';

export default function AlbumCard({ album }) {
  if (!album) return null;
  const imageUrl = album.images?.[0]?.url || 'https://via.placeholder.com/300';
  const artistName = album.artists?.map(a => a.name).join(', ') || 'Unknown Artist';

  return (
    <div className="relative group block aspect-square rounded-xl overflow-hidden bg-surface1 gradient-border-1px">
      <Link to={`/album/${album.id}`} className="block w-full h-full">
        <img src={imageUrl} alt={album.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#050508]/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute bottom-0 w-full p-4 transform translate-y-0 group-hover:-translate-y-12 transition-transform duration-300">
          <h3 className="font-display font-bold text-white text-lg truncate drop-shadow-md" title={album.name}>
            {album.name}
          </h3>
          <p className="text-secondary text-sm truncate font-medium drop-shadow-md" title={artistName}>
            {artistName}
          </p>
        </div>
      </Link>
      <Link 
        to={`/write-review/album/${album.id}`} 
        className="absolute bottom-4 left-4 right-4 bg-gradient-to-r from-primary to-secondary text-white text-center py-2 rounded-full font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 shadow-[0_0_15px_rgba(124,58,237,0.5)]"
      >
        Write Review
      </Link>
    </div>
  );
}
