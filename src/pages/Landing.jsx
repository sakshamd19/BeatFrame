import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Star, MessageSquare, Users, Disc } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/ui/GradientText';

export default function Landing() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/explore" replace />;
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 lg:py-32 bg-background relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold text-white tracking-tight max-w-4xl mb-6 leading-tight relative z-10">
          Track music you’ve <GradientText>listened</GradientText> to.
          <br/>
          Tell your friends what’s <span className="text-banger">Banger</span>.
        </h1>
        <p className="text-lg sm:text-xl text-[#94a3b8] max-w-2xl mb-10 relative z-10 font-medium">
          The social network for music lovers. Rate albums, write reviews, and discover your next favorite track through a vibrant community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto">
          <Link to="/signup" className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary text-white text-lg px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] hover:shadow-[0_0_25px_rgba(124,58,237,0.6)] hover:-translate-y-0.5">
            Get Started — It's Free
          </Link>
          <Link to="/explore" className="w-full sm:w-auto bg-surface1 hover:bg-surface2 text-white border border-white/10 text-lg px-8 py-3 rounded-full font-bold transition-colors">
            Explore Community
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-background border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-center text-white mb-12 sm:mb-16">
            Everything you need to map your music taste
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-surface1 p-6 sm:p-8 rounded-2xl border border-white/5 transition-transform hover:-translate-y-1 duration-300 shadow-xl">
              <Disc className="h-10 w-10 text-primary mb-5" />
              <h3 className="text-xl font-bold text-white mb-3">Search & Log</h3>
              <p className="text-[#94a3b8] leading-relaxed">Find any album or song using Spotify's massive database and log it to your profile.</p>
            </div>
            <div className="bg-surface1 p-6 sm:p-8 rounded-2xl border border-white/5 transition-transform hover:-translate-y-1 duration-300 shadow-xl">
              <Star className="h-10 w-10 text-banger mb-5" />
              <h3 className="text-xl font-bold text-white mb-3">Unique Ratings</h3>
              <p className="text-[#94a3b8] leading-relaxed">Rate music your way: Banger, Fire, Decent, or Skip. Stand out with colorful badges.</p>
            </div>
            <div className="bg-surface1 p-6 sm:p-8 rounded-2xl border border-white/5 transition-transform hover:-translate-y-1 duration-300 shadow-xl">
              <MessageSquare className="h-10 w-10 text-fire mb-5" />
              <h3 className="text-xl font-bold text-white mb-3">Write Reviews</h3>
              <p className="text-[#94a3b8] leading-relaxed">Share your deep thoughts on an album's production, lyrics, and vibe with the world.</p>
            </div>
            <div className="bg-surface1 p-6 sm:p-8 rounded-2xl border border-white/5 transition-transform hover:-translate-y-1 duration-300 shadow-xl">
              <Users className="h-10 w-10 text-decent mb-5" />
              <h3 className="text-xl font-bold text-white mb-3">Connect</h3>
              <p className="text-[#94a3b8] leading-relaxed">Follow friends, like reviews, and discover new bangers through your personalized feed.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
