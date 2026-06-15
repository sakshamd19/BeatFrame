import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Users, Disc } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center text-center px-4 py-20 lg:py-32 bg-gradient-to-b from-card to-background">
        <h1 className="text-5xl md:text-7xl font-extrabold text-foreground-light tracking-tight max-w-4xl mb-6 leading-tight">
          Track music you’ve <span className="text-primary">listened</span> to.
          <br/>
          Tell your friends what’s <span className="text-banger">Banger</span>.
        </h1>
        <p className="text-xl text-foreground max-w-2xl mb-10">
          The social network for music lovers. Rate albums, write reviews, and discover your next favorite track through a vibrant community.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/signup" className="bg-primary hover:bg-primary-hover text-[#14181c] text-lg px-8 py-3 rounded-md font-bold transition-colors">
            Get Started — It's Free
          </Link>
          <Link to="/explore" className="bg-card hover:bg-[#384352] text-foreground-light border border-border text-lg px-8 py-3 rounded-md font-bold transition-colors">
            Explore Community
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-foreground-light mb-16">
            Everything you need to map your music taste
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border transition-transform hover:-translate-y-1 duration-300">
              <Disc className="h-10 w-10 text-primary mb-4" />
              <h3 className="text-xl font-bold text-foreground-light mb-2">Search & Log</h3>
              <p className="text-foreground">Find any album or song using Spotify's massive database and log it to your profile.</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border transition-transform hover:-translate-y-1 duration-300">
              <Star className="h-10 w-10 text-banger mb-4" />
              <h3 className="text-xl font-bold text-foreground-light mb-2">Unique Ratings</h3>
              <p className="text-foreground">Rate music your way: Banger, Fire, Decent, or Skip. Stand out with colorful badges.</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border transition-transform hover:-translate-y-1 duration-300">
              <MessageSquare className="h-10 w-10 text-fire mb-4" />
              <h3 className="text-xl font-bold text-foreground-light mb-2">Write Reviews</h3>
              <p className="text-foreground">Share your deep thoughts on an album's production, lyrics, and vibe with the world.</p>
            </div>
            <div className="bg-card p-6 rounded-xl border border-border transition-transform hover:-translate-y-1 duration-300">
              <Users className="h-10 w-10 text-decent mb-4" />
              <h3 className="text-xl font-bold text-foreground-light mb-2">Connect</h3>
              <p className="text-foreground">Follow friends, like reviews, and discover new bangers through your personalized feed.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
