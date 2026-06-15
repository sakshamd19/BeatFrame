# BeatFrame 🎵

BeatFrame is a modern music review platform that allows users to discover the latest drops, write passionate reviews, rate tracks, and see what the community is listening to. 

## ✨ Features

- **Authentication & User Profiles:** Secure signup/login powered by Supabase. Customize your profile with a bio, avatar, top genres, and favorite artists.
- **Spotify Integration:** Real-time data from the Spotify Web API. Discover global and local (India) new releases, trending tracks, and search across Spotify's entire catalog.
- **Music Reviews & Ratings:** Share your thoughts on any album or track. Rate them on a scale of: `Banger`, `Fire`, `Decent`, or `Skip`. 
- **Community Feed:** See what other users are listening to, like their reviews, and explore trending reviews globally.
- **Debounced Search:** Instant search for artists, albums, and tracks directly from the Spotify database.

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Music Data:** Spotify Web API
- **Routing:** React Router DOM

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine. You will also need accounts for [Supabase](https://supabase.com/) and [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/).

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/beatframe.git
cd beatframe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root of your project and add your credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

*Note: Ensure your Supabase project has the `profiles`, `reviews`, `likes`, and `followers` tables set up with appropriate Row Level Security (RLS) policies.*

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 

## 📝 License

This project is open source and available under the [MIT License](LICENSE).
