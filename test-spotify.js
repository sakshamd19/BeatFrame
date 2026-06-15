
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;
  
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  });
  const tokenData = await tokenRes.json();
  const token = tokenData.access_token;

  const artistId = "1mYsTxnqsietcgZal5iKpe"; // Seedhe Maut
  
  try {
    const res1 = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Artist Status:", res1.status);
    
    const res2 = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=IN`, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Top Tracks Status:", res2.status);
    if (!res2.ok) console.log(await res2.json());

    const res3 = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=20&market=IN`, { headers: { 'Authorization': `Bearer ${token}` } });
    console.log("Albums Status:", res3.status);
    if (!res3.ok) console.log(await res3.json());
  } catch (err) {
    console.error(err);
  }
}
test();
