import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getArtist, getArtistTopTracks, getArtistAlbums } from '../services/spotify';
import TrackRow from '../components/TrackRow';
import AlbumCard from '../components/AlbumCard';

export default function ArtistDetail() {
  const { spotifyId } = useParams();
  const [artist, setArtist] = useState(null);
  const [topTracks, setTopTracks] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      setLoading(true);
      setError(null);
      try {
        const artistData = await getArtist(spotifyId);
        setArtist(artistData);

        const [tracksData, albumsData] = await Promise.all([
          getArtistTopTracks(artistData.name),
          getArtistAlbums(spotifyId)
        ]);

        setTopTracks(tracksData.tracks || []);
        
        // Filter out duplicate albums by name (Spotify often returns deluxe/clean versions)
        const uniqueAlbums = [];
        const seenNames = new Set();
        (albumsData.items || []).forEach(album => {
          if (!seenNames.has(album.name)) {
            seenNames.add(album.name);
            uniqueAlbums.push(album);
          }
        });
        setAlbums(uniqueAlbums);

      } catch (err) {
        console.error("Error fetching artist data:", err);
        setError("Couldn't load artist details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (spotifyId) {
      fetchArtistData();
    }
  }, [spotifyId]);

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Link to="/search" className="text-[#8b5cf6] hover:text-white transition-colors">
            &larr; Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-32 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {loading ? (
          <div className="flex flex-col md:flex-row gap-8 items-center mb-16 animate-pulse">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full bg-[#141414] border border-[#27272a] flex-shrink-0"></div>
            <div className="flex-1 py-4 w-full text-center md:text-left">
              <div className="h-10 md:h-12 bg-[#141414] border border-[#27272a] rounded w-3/4 mx-auto md:mx-0 mb-4"></div>
              <div className="h-6 md:h-8 bg-[#141414] border border-[#27272a] rounded w-1/2 mx-auto md:mx-0 mb-4"></div>
              <div className="h-4 bg-[#141414] border border-[#27272a] rounded w-1/4 mx-auto md:mx-0 mb-8"></div>
            </div>
          </div>
        ) : artist && (
          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left mb-16">
            <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 rounded-full overflow-hidden shadow-[0_0_30px_rgba(124,58,237,0.15)] border-4 border-surface2 mx-auto md:mx-0">
              <img src={artist.images?.[0]?.url || 'https://via.placeholder.com/300'} alt={artist.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 flex flex-col xl:flex-row gap-8 justify-between w-full items-center md:items-start xl:items-center">
              <div className="flex flex-col justify-center py-2 flex-1 w-full text-center md:text-left">
                <span className="text-[#8b5cf6] uppercase tracking-wider font-bold text-sm mb-2">Artist</span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                  {artist.name}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-8">
                  {artist.external_urls?.spotify && (
                    <a 
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-8 py-3 bg-[#1db954] hover:bg-[#1ed760] text-black rounded-full font-bold transition-colors shadow-lg shadow-[#1db954]/20 gap-2"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Listen on Spotify
                    </a>
                  )}
                  <a 
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(artist.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3 bg-[#ff0000] hover:bg-[#cc0000] text-white rounded-full font-bold transition-colors shadow-lg shadow-[#ff0000]/20 gap-2"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Listen on YouTube
                  </a>
                </div>
              </div>

              <div className="flex flex-col justify-center bg-surface1 p-6 rounded-2xl border border-white/5 shadow-xl w-full xl:w-72 flex-shrink-0 text-left">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(124,58,237,0.8)]"></span>
                  Artist Info
                </h3>
                <div className="space-y-4 text-sm">
                  {artist.followers && artist.followers.total != null && (
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-4">
                      <span className="text-[#9ca3af]">Followers</span>
                      <span className="text-white font-medium">{artist.followers.total.toLocaleString()}</span>
                    </div>
                  )}
                  {artist.genres?.length > 0 && (
                    <div className="flex flex-col border-b border-white/5 pb-2">
                      <span className="text-[#9ca3af] mb-1">Genres</span>
                      <span className="text-white font-medium capitalize truncate">{artist.genres.join(', ')}</span>
                    </div>
                  )}
                </div>
                
                {artist.uri && (
                  <div className="mt-auto border-t border-white/5 pt-4 mt-6">
                    <p className="text-[#9ca3af] text-xs uppercase tracking-wider mb-3 text-center font-semibold">Scan on Spotify</p>
                    <img 
                      src={`https://scannables.scdn.co/uri/plain/png/141414/white/320/${artist.uri}`} 
                      alt="Spotify Code" 
                      className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-16">
          {/* Top Tracks */}
          {!loading && topTracks.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-6 border-b border-white/5 pb-2">Popular Tracks</h2>
              <div className="border border-white/5 rounded-2xl overflow-hidden bg-surface1">
                {topTracks.slice(0, 5).map((track, idx) => (
                  <TrackRow key={track.id} track={track} index={idx} />
                ))}
              </div>
            </section>
          )}

          {/* Discography */}
          {!loading && albums.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold text-white mb-6 border-b border-white/5 pb-2">Discography</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {albums.map(album => (
                  <AlbumCard key={album.id} album={album} />
                ))}
              </div>
            </section>
          )}
        </div>
        
      </div>
    </div>
  );
}
