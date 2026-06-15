import fs from 'fs';
const envFile = fs.readFileSync('.env', 'utf8');
const idMatch = envFile.match(/VITE_SPOTIFY_CLIENT_ID=(.*)/);
const secMatch = envFile.match(/VITE_SPOTIFY_CLIENT_SECRET=(.*)/);
const VITE_SPOTIFY_CLIENT_ID = idMatch ? idMatch[1] : '';
const VITE_SPOTIFY_CLIENT_SECRET = secMatch ? secMatch[1] : '';

async function run() {
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(VITE_SPOTIFY_CLIENT_ID + ':' + VITE_SPOTIFY_CLIENT_SECRET).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;
  
  const url = `https://api.spotify.com/v1/search?q=The%20Weeknd&type=artist&limit=1`;
  const searchRes = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const searchData = await searchRes.json();
  const foundArtist = searchData.artists.items[0];
  console.log("Found Artist Keys:", Object.keys(foundArtist));
  console.log("Followers from Search:", foundArtist.followers);
  console.log("Genres from Search:", foundArtist.genres);
}
run();
