import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, Loader2, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import HeroOrbs from '../components/ui/HeroOrbs';
import GradientText from '../components/ui/GradientText';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Brute Force Protection State
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      navigate('/explore');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check lockout status
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000);
      setError(`Too many failed attempts. Please try again in ${remainingSeconds} seconds.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let loginEmail = identifier;

      // If it's a username (no @ symbol), call our RPC to get the email
      if (!identifier.includes('@')) {
        const { data: emailData, error: rpcError } = await supabase.rpc('get_email_by_username', { 
          p_username: identifier.toLowerCase()
        });

        if (rpcError || !emailData) {
          throw new Error('Invalid username or password');
        }
        
        loginEmail = emailData;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;
      
      if (data.session) {
        // Reset brute force counters on success
        setFailedAttempts(0);
        setLockoutUntil(null);
        
        const returnTo = location.state?.returnTo || '/explore';
        navigate(returnTo);
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Increment failed attempts
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      
      if (newAttempts >= 5) {
        setLockoutUntil(Date.now() + 30000); // 30 second lockout
        setError('Too many failed attempts. Please try again in 30 seconds.');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT HALF: Animated Floating Cards Collage (Hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#050508] border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 z-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_100%)] z-20 pointer-events-none"></div>
        
        {/* Floating elements simulating album cards */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-[10%] left-[10%] w-48 h-48 bg-surface2 rounded-xl rotate-12 animate-float shadow-2xl" style={{ animationDelay: '0s' }}>
            <img src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&q=80&w=400" alt="Album" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="absolute top-[40%] left-[60%] w-64 h-64 bg-surface2 rounded-xl -rotate-6 animate-float shadow-2xl" style={{ animationDelay: '-2s' }}>
            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=400" alt="Album" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="absolute top-[60%] left-[15%] w-56 h-56 bg-surface2 rounded-xl rotate-6 animate-float shadow-2xl" style={{ animationDelay: '-4s' }}>
            <img src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=400" alt="Album" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="absolute top-[15%] left-[70%] w-40 h-40 bg-surface2 rounded-xl -rotate-12 animate-float shadow-2xl" style={{ animationDelay: '-6s' }}>
             <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400" alt="Album" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </div>

      {/* RIGHT HALF: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 relative overflow-hidden z-10">
        <HeroOrbs />
        
        <div className="w-full max-w-md mx-auto animate-fade-in-up">
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <Music className="w-8 h-8 text-primary" />
              <span className="font-display font-bold text-2xl text-white">Soundtale</span>
            </Link>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight mb-3">
              Welcome <GradientText>Back</GradientText>
            </h2>
            <p className="text-[#94a3b8] font-medium text-lg">
              Log in to continue your musical journey.
            </p>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="relative group">
                <input 
                  id="identifier" 
                  name="identifier" 
                  type="text" 
                  required 
                  value={identifier} 
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 text-white placeholder-transparent focus:outline-none focus:ring-0 focus:border-transparent peer"
                  placeholder="Username or Email"
                />
                <label htmlFor="identifier" className="absolute left-0 -top-3.5 text-sm text-[#94a3b8] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary font-medium pointer-events-none">
                  Username or Email
                </label>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 peer-focus:w-full"></div>
              </div>

              <div className="relative group pt-2">
                <div className="absolute right-0 top-0 text-sm z-10">
                  <a href="#" className="font-medium text-[#94a3b8] hover:text-white transition-colors">
                    Forgot password?
                  </a>
                </div>
                <input 
                  id="password" 
                  name="password" 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 text-white placeholder-transparent focus:outline-none focus:ring-0 focus:border-transparent peer"
                  placeholder="Password"
                />
                <label htmlFor="password" className="absolute left-0 -top-3.5 text-sm text-[#94a3b8] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary font-medium pointer-events-none">
                  Password
                </label>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 peer-focus:w-full"></div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || (lockoutUntil && Date.now() < lockoutUntil)}
              className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-full font-bold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Log In <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            {/* Social Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#050508] text-[#475569]">or continue with</span>
              </div>
            </div>

            <div className="text-center">
              <Link to="/signup" className="font-bold text-[#94a3b8] hover:text-white transition-colors">
                Don't have an account? <span className="text-secondary">Sign up</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
