// Tokens are fetched from our secure serverless backend

// Token caching in localStorage
const CACHE_KEY = 'spotify_token';
const EXPIRY_KEY = 'spotify_token_expiry';

let tokenPromise = null;

export const getSpotifyToken = async () => {
  const cachedToken = localStorage.getItem(CACHE_KEY);
  const expiryTime = localStorage.getItem(EXPIRY_KEY);

  if (cachedToken && expiryTime && Date.now() < parseInt(expiryTime, 10)) {
    return cachedToken;
  }

  // If a request is already in progress, return that promise

  // If a request is already in progress, return that promise
  if (tokenPromise) return tokenPromise;

  tokenPromise = (async () => {
    try {
      const response = await fetch('/api/spotify-token', {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to fetch Spotify token');

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem(CACHE_KEY, data.access_token);
        // Expiry time in ms minus a 1-minute buffer
        localStorage.setItem(EXPIRY_KEY, (Date.now() + (data.expires_in - 60) * 1000).toString());
        return data.access_token;
      }
    } catch (error) {
      console.error('Error fetching Spotify token:', error);
    } finally {
      tokenPromise = null;
    }
    return null;
  })();

  return tokenPromise;
};

const fetchSpotifyAPI = async (endpoint) => {
  let token = await getSpotifyToken();
  if (!token) throw new Error("No Spotify token available");

  // Ensure market=IN is present if it's an endpoint that uses market (albums, tracks, search)
  // Skip for endpoints where market is invalid or already present.
  let url = `https://api.spotify.com/v1${endpoint}`;
  if (!url.includes('market=')) {
    url += url.includes('?') ? '&market=IN' : '?market=IN';
  }

  const makeRequest = async (authToken) => {
    return fetch(url, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
  };

  let response = await makeRequest(token);

  if (response.status === 401) {
    console.log("Spotify token expired or invalid, clearing cache and retrying...");
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    
    token = await getSpotifyToken();
    if (!token) throw new Error("Failed to get fresh Spotify token");
    
    response = await makeRequest(token);
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error(`Spotify API Error on ${endpoint}:`, errData);
    throw new Error(`Spotify API request failed with status ${response.status}`);
  }

  return response.json();
};

export const searchSpotify = async (query, type = 'album,artist,track') => {
  const isMultiType = type.includes(',');
  const limit = isMultiType ? 5 : 10;
  return fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=${type}&limit=${limit}`);
};

export const getAlbum = async (albumId) => {
  return fetchSpotifyAPI(`/albums/${albumId}`);
};

export const getAlbumTracks = async (albumId) => {
  return fetchSpotifyAPI(`/albums/${albumId}/tracks?limit=50`);
};

export const getTrack = async (trackId) => {
  return fetchSpotifyAPI(`/tracks/${trackId}`);
};

export const getNewReleases = async (market = 'IN') => {
  try {
    const query = "tag:new";
    return await fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=album&limit=10&market=${market}`);
  } catch (error) {
    console.error(`Error fetching new releases:`, error);
    throw error;
  }
};

export const getTrendingTracks = async (region = 'global') => {
  try {
    // Top 50 Global: 37i9dQZEVXbMDoHDwVN2tF
    // Top 50 India: 37i9dQZEVXbMZ5PAcKIGGZ
    const playlistId = region === 'India' ? '37i9dQZEVXbMZ5PAcKIGGZ' : '37i9dQZEVXbMDoHDwVN2tF';
    const data = await fetchSpotifyAPI(`/playlists/${playlistId}/tracks?limit=5`);
    return { items: data.items || [] };
  } catch (error) {
    console.error(`Error fetching trending tracks:`, error);
    throw error;
  }
};

export const getArtist = async (artistId) => {
  // Artist endpoint doesn't accept market param
  let token = await getSpotifyToken();
  if (!token) throw new Error("No Spotify token available");
  
  const makeRequest = async (authToken) => {
    return fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
  };

  let response = await makeRequest(token);
  if (response.status === 401) {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    token = await getSpotifyToken();
    response = await makeRequest(token);
  }
  
  if (!response.ok) throw new Error('Failed to get artist details');
  return response.json();
};

export const getArtistTopTracks = async (artistName, market = 'IN') => {
  try {
    const query = `artist:"${artistName}"`;
    const data = await fetchSpotifyAPI(`/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=${market}`);
    return { tracks: data.tracks?.items || [] };
  } catch (error) {
    console.error('Error fetching artist top tracks:', error);
    throw error;
  }
};

export const getArtistAlbums = async (artistId, market = 'IN') => {
  return fetchSpotifyAPI(`/artists/${artistId}/albums?market=${market}`);
};

export const getRelatedArtists = async (artistId) => {
  return fetchSpotifyAPI(`/artists/${artistId}/related-artists`);
};
