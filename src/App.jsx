import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import { Loader2 } from 'lucide-react';

const Landing = lazy(() => import('./pages/Landing'));
const Explore = lazy(() => import('./pages/Explore'));
const Search = lazy(() => import('./pages/Search'));
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'));
const TrackDetail = lazy(() => import('./pages/TrackDetail'));
const ArtistDetail = lazy(() => import('./pages/ArtistDetail'));
const EditReview = lazy(() => import('./pages/EditReview'));
const Profile = lazy(() => import('./pages/Profile'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const Signup = lazy(() => import('./pages/Signup'));
const Login = lazy(() => import('./pages/Login'));

// NotFound component for 404s
const NotFound = () => (
  <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
    <h1 className="text-6xl font-black text-white mb-4">404</h1>
    <h2 className="text-2xl font-bold text-[#94a3b8] mb-8">Page Not Found</h2>
    <p className="text-[#64748b] max-w-md mb-8">The page you're looking for doesn't exist or has been moved.</p>
    <a href="/" className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
      Go Home
    </a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col">
          <Suspense fallback={
            <div className="flex-1 flex items-center justify-center min-h-[70vh]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/search" element={<Search />} />
              <Route path="/album/:spotifyId" element={<AlbumDetail />} />
              <Route path="/track/:spotifyId" element={<TrackDetail />} />
              <Route path="/artist/:spotifyId" element={<ArtistDetail />} />
              <Route path="/edit-review/:reviewId" element={<ProtectedRoute><EditReview /></ProtectedRoute>} />
              <Route path="/profile/:username" element={<Profile />} />
              <Route path="/settings" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
