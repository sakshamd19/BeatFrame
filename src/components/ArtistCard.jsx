import React from 'react';
import { Link } from 'react-router-dom';

export default function ArtistCard({ artist }) {
  if (!artist) return null;
  const imageUrl = artist.images?.[0]?.url || 'https://via.placeholder.com/150';

  return (
    <Link to={`/artist/${artist.id}`} className="cursor-pointer group flex flex-col items-center p-3 transition-transform duration-300 hover:scale-[1.05]">
      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-primary to-secondary mb-4 group-hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-shadow duration-300">
        <div className="w-full h-full rounded-full overflow-hidden bg-background border-4 border-background">
          <img src={imageUrl} alt={artist.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" />
        </div>
      </div>
      <h3 className="font-display font-bold text-white text-center truncate w-full text-lg group-hover:text-secondary transition-colors" title={artist.name}>
        {artist.name}
      </h3>
    </Link>
  );
}
