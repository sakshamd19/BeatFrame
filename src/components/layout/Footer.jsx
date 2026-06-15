import React from 'react';
import { Music } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <Music className="h-6 w-6 text-foreground" />
          <span className="font-semibold text-foreground-light">BeatFrame</span>
        </div>
        <p className="text-foreground text-sm">
          &copy; {new Date().getFullYear()} BeatFrame. Music review & rating platform.
        </p>
      </div>
    </footer>
  );
}
