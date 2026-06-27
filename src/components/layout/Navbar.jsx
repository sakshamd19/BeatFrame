import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import FrequencyBars from '../ui/FrequencyBars';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { name: 'Explore', path: '/explore' }
  ];

  return (
    <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#050508]/95 backdrop-blur-md border-b border-white/5' : 'bg-transparent'}`}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <FrequencyBars className="group-hover:opacity-80 transition-opacity" />
              <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:gradient-text transition-all">SargamBeat</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link key={link.name} to={link.path} className="relative group py-2">
                  <span className={`font-sans font-medium transition-colors ${isActive ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'}`}>
                    {link.name}
                  </span>
                  <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] transition-all duration-300 ${isActive ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-50'} origin-left rounded-full`}></span>
                </Link>
              );
            })}
            
            <Link to="/search" className="text-[#94a3b8] hover:text-[#06b6d4] transition-colors p-2 hover:bg-white/5 rounded-full">
              <Search className="h-5 w-5" />
            </Link>
            
            <div className="flex items-center gap-4 ml-2 pl-6 border-l border-white/10">
              {loading ? (
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="w-9 h-9 rounded-full bg-white/5"></div>
                  <div className="w-16 h-4 rounded bg-white/5"></div>
                </div>
              ) : user ? (
                <div className="flex items-center gap-6">
                  <Link to={`/profile/${profile?.username}`} className="flex items-center gap-3 group">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-9 h-9 rounded-full object-cover border border-white/10 group-hover:border-[#7c3aed] transition-colors" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-surface2 flex items-center justify-center border border-white/10 group-hover:border-[#7c3aed] transition-colors">
                        <UserIcon className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <span className="text-white font-medium group-hover:text-[#06b6d4] transition-colors">{profile?.username}</span>
                  </Link>
                  <button onClick={handleSignOut} className="text-[#94a3b8] hover:text-[#f97316] transition-colors p-2 hover:bg-white/5 rounded-full" title="Sign Out">
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Link to="/login" className="px-5 py-2 rounded-full font-sans font-medium text-white border border-white/20 hover:border-white/40 hover:bg-white/5 transition-all active:scale-95">
                    Log In
                  </Link>
                  <Link to="/signup" className="px-5 py-2 rounded-full font-sans font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:shadow-[0_0_15px_rgba(124,58,237,0.5)] transition-all active:scale-95">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <Link to="/search" className="text-[#94a3b8] hover:text-[#06b6d4] transition-colors p-2">
              <Search className="h-5 w-5" />
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-white focus:outline-none p-2 hover:bg-white/5 rounded-full transition-colors">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-[#0f0f14]/95 backdrop-blur-md border-b border-white/5 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-6 flex flex-col gap-2">
          {navLinks.map(link => (
            <Link key={link.name} to={link.path} className="px-4 py-3 rounded-xl text-lg font-display font-medium text-[#94a3b8] hover:text-white hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>
              {link.name}
            </Link>
          ))}
          
          <div className="h-[1px] w-full bg-white/5 my-2"></div>
          
          {loading ? (
             <div className="flex flex-col gap-2 animate-pulse px-4 py-3">
               <div className="h-6 bg-white/5 rounded w-24 mb-2"></div>
               <div className="h-6 bg-white/5 rounded w-32"></div>
             </div>
          ) : user ? (
             <div className="flex flex-col gap-2">
               <Link to={`/profile/${profile?.username}`} className="px-4 py-3 rounded-xl text-lg font-display font-medium text-white hover:bg-white/5 transition-colors flex items-center gap-3" onClick={() => setIsOpen(false)}>
                 <UserIcon className="w-5 h-5 text-[#7c3aed]" />
                 Profile
               </Link>
               <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="text-left px-4 py-3 rounded-xl text-lg font-display font-medium text-[#f97316] hover:bg-[#f97316]/10 transition-colors flex items-center gap-3">
                 <LogOut className="w-5 h-5" />
                 Sign Out
               </button>
             </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link to="/login" className="w-full text-center px-4 py-3 rounded-full text-lg font-sans font-medium text-white border border-white/20 hover:bg-white/5 transition-colors" onClick={() => setIsOpen(false)}>
                Log In
              </Link>
              <Link to="/signup" className="w-full text-center px-4 py-3 rounded-full text-lg font-sans font-bold text-white bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] transition-colors" onClick={() => setIsOpen(false)}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
