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
    <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left mb-12">
      <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.15)] border border-white/5">
        <img src={imageUrl} alt={album.name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 flex flex-col xl:flex-row gap-8 justify-between w-full items-center md:items-start xl:items-center">
        <div className="flex flex-col justify-center min-h-[12rem] md:min-h-[16rem] py-2 flex-1 w-full">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            {album.name}
          </h1>
          <p className="text-xl md:text-2xl text-[#9ca3af] mb-2 font-medium">
            {artistLinks}
          </p>
          <p className="text-sm text-[#6b7280] mb-8 uppercase tracking-wider font-semibold">
            {releaseYear} • {album.total_tracks} tracks
          </p>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 w-full">
            {album.external_urls?.spotify && (
              <a 
                href={album.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#1db954] hover:bg-[#1ed760] text-black rounded-md font-bold transition-colors shadow-lg shadow-[#1db954]/20 gap-2"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
                Listen on Spotify
              </a>
            )}
            
            <a 
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#ff0000]/20 gap-2"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              Listen on YouTube
            </a>

            <a 
              href={`https://music.apple.com/search?term=${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#fa243c] hover:bg-[#e02036] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#fa243c]/20 gap-2"
            >
              <Music className="w-5 h-5" />
              Listen on Apple Music
            </a>

            <a 
              href={`https://music.amazon.com/search/${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#00a8e1] hover:bg-[#0096c9] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#00a8e1]/20 gap-2"
            >
              <Headphones className="w-5 h-5" />
              Listen on Amazon Music
            </a>

            <a 
              href={`https://www.jiosaavn.com/search/${encodeURIComponent(album.name + ' ' + (album.artists?.[0]?.name || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 w-full sm:w-[260px] whitespace-nowrap bg-[#2bc5b4] hover:bg-[#25ab9c] text-white rounded-md font-bold transition-colors shadow-lg shadow-[#2bc5b4]/20 gap-2"
            >
              <Radio className="w-5 h-5" />
              Listen on JioSaavn
            </a>
          </div>
        </div>

        <div className="flex flex-col justify-center bg-surface1 p-6 rounded-2xl border border-white/5 shadow-xl w-full xl:w-72 flex-shrink-0 mt-4 xl:mt-0 text-left">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(124,58,237,0.8)]"></span>
            Album Info
          </h3>
          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#9ca3af]">Released</span>
              <span className="text-white font-medium">{album.release_date}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-[#9ca3af]">Label</span>
              <span className="text-white font-medium truncate ml-4" title={albumLabel}>{albumLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#9ca3af]">Type</span>
              <span className="text-white font-medium capitalize">{album.album_type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
