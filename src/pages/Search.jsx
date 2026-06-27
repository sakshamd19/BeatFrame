import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import AlbumCard from '../components/AlbumCard';
import ArtistCard from '../components/ArtistCard';
import TrackRow from '../components/TrackRow';
import SkeletonGrid from '../components/SkeletonGrid';
import { searchSpotify, getRelatedArtists } from '../services/spotify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Music } from 'lucide-react';
import GradientText from '../components/ui/GradientText';

const DEFAULT_SUGGESTIONS = ["Arijit Singh", "The Weeknd", "AP Dhillon", "Coldplay", "Diljit Dosanjh", "Drake"];
const TABS = ['All', 'Albums', 'Artists', 'Tracks'];

export default function Search() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [results, setResults] = useState(null);
  const [userResults, setUserResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState(DEFAULT_SUGGESTIONS);
  const [favoriteArtists, setFavoriteArtists] = useState([]);

  // Fetch user's favorite artists
  useEffect(() => {
    if (!user) return;
    
    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('favorite_artists')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.favorite_artists && data.favorite_artists.length > 0) {
          setFavoriteArtists(data.favorite_artists);
        }
      } catch (err) {
        console.error("Error fetching favorite artists:", err);
      }
    };
    
    fetchFavorites();
  }, [user]);

  // Update suggestions dynamically based on favorite artists
  useEffect(() => {
    const updateSuggestions = async () => {
      if (favoriteArtists.length === 0) return;
      
      try {
        const randomArtist = favoriteArtists[Math.floor(Math.random() * favoriteArtists.length)];
        const related = await getRelatedArtists(randomArtist.id);
        
        if (related?.artists?.length > 0) {
          const shuffled = related.artists.sort(() => 0.5 - Math.random());
          const newSuggestions = shuffled.slice(0, 6).map(a => a.name);
          setSuggestions(newSuggestions);
        }
      } catch (err) {
        console.error("Error updating suggestions:", err);
      }
    };

    if (favoriteArtists.length > 0) {
      updateSuggestions();
      const interval = setInterval(updateSuggestions, 10 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [favoriteArtists]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults(null);
        setUserResults(null);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        if (query.trim().startsWith('@')) {
          const usernameQuery = query.trim().slice(1).trim();
          if (!usernameQuery) {
            setUserResults([]);
            setResults(null);
            setLoading(false);
            return;
          }
          
          const { data, error: sbError } = await supabase
            .from('profiles')
            .select('*')
            .or(`username.ilike.%${usernameQuery}%,full_name.ilike.%${usernameQuery}%`)
            .limit(20);
            
          if (sbError) throw sbError;
          setUserResults(data);
          setResults(null);
        } else {
          let searchType = 'album,artist,track';
          if (activeTab === 'Albums') searchType = 'album';
          else if (activeTab === 'Artists') searchType = 'artist';
          else if (activeTab === 'Tracks') searchType = 'track';

          const data = await searchSpotify(query.trim(), searchType);
          setResults(data);
          setUserResults(null);
        }
      } catch (err) {
        console.error("Search error:", err);
        setError("Search failed. Try again.");
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
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-10 tracking-tight">Start typing to discover <GradientText>music</GradientText></h2>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-3xl mx-auto">
            {suggestions.map(s => (
              <button 
                key={s} 
                onClick={() => handleSuggestionClick(s)}
                className="bg-surface2 hover:bg-gradient-to-r hover:from-primary hover:to-secondary border border-white/5 hover:border-transparent text-[#94a3b8] hover:text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      );
    }

    const hasNoResults = (results && (
      (!results.albums || results.albums.items.length === 0) &&
      (!results.artists || results.artists.items.length === 0) &&
      (!results.tracks || results.tracks.items.length === 0)
    )) || (userResults && userResults.length === 0);

    if (hasNoResults) {
      return (
        <div className="text-center py-24 animate-fade-in-up">
          <h2 className="text-3xl font-display font-bold text-white mb-4">No results found for '{query}'</h2>
          <p className="text-secondary text-lg">Check your spelling or try different keywords.</p>
        </div>
      );
    }

    if (!results && !userResults) return null;

    if (userResults) {
      return (
        <div className="space-y-8 animate-fade-in-up">
          <section>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-6 sm:mb-8 border-b border-white/5 pb-4">Profiles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {userResults.map(profile => (
                <Link key={profile.id} to={`/profile/${profile.username}`} className="bg-surface1 hover:bg-surface2 border border-white/5 rounded-2xl p-6 flex items-center gap-4 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/50 group">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt={profile.username} className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xl font-bold text-white group-hover:scale-105 transition-transform">
                      {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg truncate group-hover:text-primary transition-colors">{profile.full_name || profile.username}</h3>
                    <p className="text-secondary text-sm truncate">@{profile.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      );
    }

    return (
      <div className="space-y-16 animate-fade-in-up">
        {(activeTab === 'All' || activeTab === 'Albums') && results.albums?.items?.length > 0 && (
          <section>
            {activeTab === 'All' && <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-6 sm:mb-8 border-b border-white/5 pb-4">Albums</h2>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {results.albums.items.slice(0, activeTab === 'All' ? 5 : 20).map(album => (
                <AlbumCard key={album.id} album={album} />
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'All' || activeTab === 'Artists') && results.artists?.items?.length > 0 && (
          <section>
            {activeTab === 'All' && <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-6 sm:mb-8 border-b border-white/5 pb-4">Artists</h2>}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6">
              {results.artists.items.slice(0, activeTab === 'All' ? 6 : 20).map(artist => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </section>
        )}

        {(activeTab === 'All' || activeTab === 'Tracks') && results.tracks?.items?.length > 0 && (
          <section>
            {activeTab === 'All' && <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-6 sm:mb-8 border-b border-white/5 pb-4">Tracks</h2>}
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
    <div className="min-h-screen bg-background pb-24 pt-24 sm:pt-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <SearchBar onSearch={handleSearch} initialValue={query} />
        
        {/* Filter Tabs - Hidden when searching for users */}
        {!query.trim().startsWith('@') && (
          <div className="flex justify-start sm:justify-center mt-6 sm:mt-10 gap-2 sm:gap-3 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
        )}
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {renderContent()}
      </div>
    </div>
  );
}
