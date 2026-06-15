import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import AlbumCard from '../components/AlbumCard';
import ArtistCard from '../components/ArtistCard';
import TrackRow from '../components/TrackRow';
import SkeletonGrid from '../components/SkeletonGrid';
import { searchSpotify } from '../services/spotify';
import { Music } from 'lucide-react';
import GradientText from '../components/ui/GradientText';

const SUGGESTIONS = ["Arijit Singh", "The Weeknd", "AP Dhillon", "Coldplay", "Diljit Dosanjh", "Drake"];
const TABS = ['All', 'Albums', 'Artists', 'Tracks'];

export default function Search() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(null);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        let searchType = 'album,artist,track';
        if (activeTab === 'Albums') searchType = 'album';
        else if (activeTab === 'Artists') searchType = 'artist';
        else if (activeTab === 'Tracks') searchType = 'track';

        const data = await searchSpotify(query, searchType);
        setResults(data);
      } catch (err) {
        setError("Couldn't connect to Spotify. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, activeTab]);

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
  };

  const renderContent = () => {
    if (loading) {
      if (activeTab === 'All') {
        return (
          <div className="space-y-16">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">Albums</h2>
              <SkeletonGrid type="album" count={5} />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">Artists</h2>
              <SkeletonGrid type="artist" count={6} />
            </div>
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">Tracks</h2>
              <SkeletonGrid type="track" count={5} />
            </div>
          </div>
        );
      }
      return <SkeletonGrid type={activeTab.slice(0, -1).toLowerCase()} count={12} />;
    }

    if (error) {
      return (
        <div className="text-center py-20">
          <p className="text-red-400 mb-4 font-medium">{error}</p>
          <button 
            onClick={() => handleSearch(query)}
            className="bg-surface2 hover:bg-surface1 border border-white/10 text-white px-8 py-3 rounded-full font-bold transition-colors"
          >
            Retry Connection
          </button>
        </div>
      );
    }

    if (!query) {
      return (
        <div className="text-center py-8 animate-fade-in-up">
          <Music className="w-20 h-20 text-primary mx-auto mb-8 opacity-80" />
          <h2 className="text-4xl font-display font-bold text-white mb-10 tracking-tight">Start typing to discover <GradientText>music</GradientText></h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {SUGGESTIONS.map(s => (
              <button 
                key={s} 
                onClick={() => handleSuggestionClick(s)}
                className="bg-surface2 hover:bg-gradient-to-r hover:from-primary hover:to-secondary border border-white/5 hover:border-transparent text-[#94a3b8] hover:text-white px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      );
    }

    const hasNoResults = results && (
      (!results.albums || results.albums.items.length === 0) &&
      (!results.artists || results.artists.items.length === 0) &&
      (!results.tracks || results.tracks.items.length === 0)
    );

    if (hasNoResults) {
      return (
        <div className="text-center py-24 animate-fade-in-up">
          <h2 className="text-3xl font-display font-bold text-white mb-4">No results found for '{query}'</h2>
          <p className="text-secondary text-lg">Check your spelling or try different keywords.</p>
        </div>
      );
    }

    if (!results) return null;

    return (
      <div className="space-y-16 animate-fade-in-up">
        {(activeTab === 'All' || activeTab === 'Albums') && results.albums?.items?.length > 0 && (
          <section>
            {activeTab === 'All' && <h2 className="text-3xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">Albums</h2>}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.albums.items.slice(0, activeTab === 'All' ? 5 : 20).map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'All' || activeTab === 'Artists') && results.artists?.items?.length > 0 && (
          <section>
            {activeTab === 'All' && <h2 className="text-3xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">Artists</h2>}
            <div className="flex flex-wrap gap-8">
              {results.artists.items.slice(0, activeTab === 'All' ? 6 : 20).map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'All' || activeTab === 'Tracks') && results.tracks?.items?.length > 0 && (
          <section>
            {activeTab === 'All' && <h2 className="text-3xl font-display font-bold text-white mb-8 border-b border-white/5 pb-4">Tracks</h2>}
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-surface1">
              {results.tracks.items.slice(0, activeTab === 'All' ? 5 : 20).map((track, idx) => (
                <TrackRow key={track.id} track={track} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24 pt-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <SearchBar onSearch={handleSearch} initialValue={query} />
        
        {/* Filter Tabs */}
        <div className="flex justify-center mt-10 gap-3 overflow-x-auto pb-4">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' 
                  : 'bg-surface1 border border-white/10 text-[#94a3b8] hover:text-white hover:border-white/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {renderContent()}
      </div>
    </div>
  );
}
