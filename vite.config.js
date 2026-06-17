import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Custom plugin to handle our Vercel serverless function locally
function localServerlessMock() {
  return {
    name: 'local-serverless-mock',
    configureServer(server) {
      server.middlewares.use('/api/spotify-token', async (req, res, next) => {
        if (req.method === 'POST') {
          try {
            // Load .env or .env.local variables in Vite
            const env = loadEnv(server.config.mode, process.cwd(), '');
            const clientId = env.SPOTIFY_CLIENT_ID || env.VITE_SPOTIFY_CLIENT_ID;
            const clientSecret = env.SPOTIFY_CLIENT_SECRET || env.VITE_SPOTIFY_CLIENT_SECRET;

            if (!clientId || !clientSecret) {
              res.statusCode = 500;
              return res.end(JSON.stringify({ error: 'Missing local credentials. Add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET to .env.local' }));
            }

            const response = await fetch('https://accounts.spotify.com/api/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
              },
              body: 'grant_type=client_credentials'
            });

            const data = await response.json();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              access_token: data.access_token,
              expires_in: data.expires_in
            }));
          } catch (err) {
            console.error(err);
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to fetch local token' }));
          }
        } else {
          next();
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localServerlessMock()],
  server: {
    host: '127.0.0.1'
  }
})
