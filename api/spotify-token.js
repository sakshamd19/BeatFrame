// Basic in-memory rate limit store
// Note: In serverless this resets frequently, but it's enough to stop burst scraping
const rateLimit = new Map();

export default async function handler(req, res) {
  // 1. CORS Headers (Allow only from specific origins if needed, but Vercel handles standard routing)
  res.setHeader('Access-Control-Allow-Origin', '*'); // Adjust this in production if not same-origin
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // 2. Rate Limiting (Priority 4)
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minute window
  const maxRequests = 10; // Max 10 requests per minute per IP

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const limitData = rateLimit.get(ip);
    if (now > limitData.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    } else {
      limitData.count++;
      if (limitData.count > maxRequests) {
        return res.status(429).json({ error: 'Too Many Requests - Rate Limit Exceeded' });
      }
    }
  }

  // 3. Credentials
  // We prefer non-VITE prefixed vars so they aren't exposed to the client, 
  // but we fallback for compatibility during the transition.
  const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.VITE_SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET || process.env.VITE_SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Missing Spotify Server Credentials");
    return res.status(500).json({ error: 'Server Configuration Error' });
  }

  // 4. Fetch Token securely
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify API Error: ${response.status}`);
    }

    const data = await response.json();
    
    // Only return the access_token and expires_in to the frontend. Never the secret.
    return res.status(200).json({
      access_token: data.access_token,
      expires_in: data.expires_in
    });

  } catch (error) {
    console.error('Error fetching Spotify token:', error);
    return res.status(500).json({ error: 'Failed to fetch Spotify token' });
  }
}
