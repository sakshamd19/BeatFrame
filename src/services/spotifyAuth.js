const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
// Use the current domain (e.g. localhost:5173 or your production Vercel URL)
const REDIRECT_URI = window.location.origin + '/spotify-callback';

export const getSpotifyAuthUrl = () => {
  const scopes = [
    'user-read-recently-played',
    'user-read-currently-playing',
    'user-read-playback-state',
    'user-read-private'
  ];
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: scopes.join(' '),
    show_dialog: 'true'
  });

  return `https://accounts.spotify.com/authorize?${params.toString()}`;
};

export const exchangeCodeForTokens = async (code) => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI
    })
  });

  if (!response.ok) throw new Error('Failed to exchange code');
  return response.json();
};

export const getAccessTokenFromRefresh = async (refreshToken) => {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) throw new Error('Failed to refresh token');
  return response.json();
};

export const fetchSpotifyActivity = async (accessToken) => {
  const [recentRes, currentRes, profileRes] = await Promise.all([
    fetch('https://api.spotify.com/v1/me/player/recently-played?limit=50', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }),
    fetch('https://api.spotify.com/v1/me/player/currently-playing', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).catch(() => null),
    fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    }).catch(() => null)
  ]);

  const activity = { recently_played: [], currently_playing: null, user: null };

  if (recentRes.ok) {
    const recentData = await recentRes.json();
    activity.recently_played = recentData.items;
  }

  if (currentRes && currentRes.status === 200) {
    const currentData = await currentRes.json();
    if (currentData && currentData.item) {
      activity.currently_playing = currentData;
    }
  }

  if (profileRes && profileRes.status === 200) {
    const profileData = await profileRes.json();
    activity.user = profileData;
  }

  return activity;
};
