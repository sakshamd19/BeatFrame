import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Headphones, Radio } from 'lucide-react';

export default function AlbumHeader({ album }) {
  if (!album) return null;
  const imageUrl = album.images?.[0]?.url || 'https://via.placeholder.com/300';
  const artistLinks = album.artists ? (
    album.artists.map((a, i) => (
      <React.Fragment key={a.id}>
        <Link to={`/artist/${a.id}`} className="hover:text-white transition-colors">{a.name}</Link>
        {i < album.artists.length - 1 && ', '}
      </React.Fragment>
    ))
  ) : 'Unknown Artist';
  const releaseYear = album.release_date ? album.release_date.split('-')[0] : '';
  
  let albumLabel = album.label;
  if (!albumLabel && album.copyrights && album.copyrights.length > 0) {
    const copyrightText = album.copyrights[0].text;
    albumLabel = copyrightText.replace(/^([©℗]\s*|\([cC]\)\s*|\([pP]\)\s*)*([0-9]{4}\s+)?/, '').trim();
  }
  albumLabel = albumLabel || 'Independent';

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left mb-12">
      <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.15)] border border-white/5">
        <img src={imageUrl} alt={album.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col justify-center min-h-[12rem] md:min-h-[16rem] py-2 w-full">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight leading-tight">
          {album.name}
        </h1>
        <p className="text-xl md:text-2xl text-[#9ca3af] mb-4 font-medium">
          {artistLinks}
        </p>
        <p className="text-sm text-[#d1d5db] mb-8 uppercase tracking-wider font-semibold flex flex-wrap items-center justify-center md:justify-start gap-2">
          <span>{releaseYear}</span>
          <span className="text-[#6b7280]">•</span>
          <span className="truncate max-w-[200px] sm:max-w-xs">{albumLabel}</span>
          <span className="text-[#6b7280]">•</span>
          <span className="capitalize">{album.album_type}</span>
          <span className="text-[#6b7280]">•</span>
          <span>{album.total_tracks} tracks</span>
        </p>
          <div className="flex items-center gap-3 mt-4 sm:mt-0 flex-wrap justify-center md:justify-start">
            {album.external_urls?.spotify && (
              <a 
                href={album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 text-[#1db954] hover:bg-[#1db954]/10 rounded-full transition-all"
                title="Listen on Spotify"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
              </a>
            )}
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-[#ff0000] hover:bg-[#ff0000]/10 rounded-full transition-all"
              title="Listen on YouTube"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>

            <a 
              href={`https://music.apple.com/search?term=${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-[#fa243c] hover:bg-[#fa243c]/10 rounded-full transition-all"
              title="Listen on Apple Music"
            >
              <Music className="w-6 h-6" />
            </a>

            <a 
              href={`https://music.amazon.com/search/${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-[#00a8e1] hover:bg-[#00a8e1]/10 rounded-full transition-all"
              title="Listen on Amazon Music"
            >
              <Headphones className="w-6 h-6" />
            </a>

            <a 
              href={`https://www.jiosaavn.com/search/${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 text-[#2bc5b4] hover:bg-[#2bc5b4]/10 rounded-full transition-all"
              title="Listen on JioSaavn"
            >
              <Radio className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
  );
}
