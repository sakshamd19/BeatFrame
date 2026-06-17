import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Music, Loader2, Search, X, Check, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { searchSpotify } from '../services/spotify';
import HeroOrbs from '../components/ui/HeroOrbs';
import GradientText from '../components/ui/GradientText';

const GENRES = [
  'Hip Hop', 'Pop', 'R&B', 'Rock', 'Electronic', 
  'Indie', 'K-Pop', 'Country', 'Jazz', 'Classical', 'Metal', 'Latin'
];

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Step 1 State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');

  useEffect(() => {
    setCaptcha({
      num1: Math.floor(Math.random() * 10) + 1,
      num2: Math.floor(Math.random() * 10) + 1
    });
  }, []);

  // Step 2 State
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);

  const [searchError, setSearchError] = useState(null);

  // Search Spotify Debounce
  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearchError(null);
        const results = await searchSpotify(searchQuery, 'artist');
        if (!results || !results.artists || !results.artists.items) {
          setSearchError("No results found or invalid response from Spotify.");
          return;
        }
        setSearchResults(results.artists.items.slice(0, 5) || []);
      } catch (err) {
        console.error(err);
        setSearchError("Failed to fetch artists. " + err.message);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Username Uniqueness Debounce
  useEffect(() => {
    if (!formData.username) {
      setUsernameAvailable(null);
      setCheckingUsername(false);
      return;
    }

    // Don't check if there's already a format error (e.g. spaces)
    if (/\s/.test(formData.username) || formData.username !== formData.username.toLowerCase()) {
      setUsernameAvailable(false);
      return;
    }

    setCheckingUsername(true);
    const timer = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username)
          .maybeSingle();
        
        if (error) throw error;
        
        // If data exists, the username is taken
        if (data) {
          setUsernameAvailable(false);
          setErrors(prev => ({ ...prev, username: 'Username is already taken' }));
        } else {
          setUsernameAvailable(true);
          // clear username error if it was 'taken'
          if (errors.username === 'Username is already taken') {
            setErrors(prev => ({ ...prev, username: '' }));
          }
        }
      } catch (err) {
        console.error("Error checking username:", err);
      } finally {
        setCheckingUsername(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [formData.username]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName' && !value) error = 'Full name is required';
    if (name === 'username') {
      if (!value) error = 'Username is required';
      else if (!/^[a-z0-9_]{3,20}$/.test(value)) error = 'Must be 3-20 chars: lowercase, numbers, underscores';
    }
    if (name === 'email') {
      if (!value) error = 'Email is required';
      else if (!/^\S+@\S+\.\S+$/.test(value)) error = 'Invalid email format';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 8) error = 'Password must be at least 8 characters';
      else if (!/\d/.test(value)) error = 'Password must contain at least 1 number';
    }
    if (name === 'confirmPassword') {
      if (value !== formData.password) error = 'Passwords do not match';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full name is required';
    
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (!/^[a-z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.username = 'Must be 3-20 chars: lowercase, numbers, underscores';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = 'Password must contain at least 1 number';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (parseInt(captchaInput, 10) !== captcha.num1 + captcha.num2) {
      newErrors.captcha = 'Incorrect security question answer';
    }

    if (usernameAvailable === false) {
      newErrors.username = 'Username is already taken';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === 'username' ? value.toLowerCase() : value;
    setFormData({ ...formData, [name]: finalValue });
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    validateField(e.target.name, e.target.value);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      if (data.user) {
        // Supabase returns a fake user object if the email is already registered
        if (data.user.identities && data.user.identities.length === 0) {
          throw new Error("This email is already registered. Please log in.");
        }

        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: formData.username,
            full_name: formData.fullName
          });

        if (profileError) throw profileError;

        setUserId(data.user.id);
        setStep(2); // Move to onboarding
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.message.includes('unique constraint') || err.message.includes('duplicate key')) {
         setErrors({ username: 'Username already taken' });
      } else {
         setErrors({ submit: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const addArtist = (artist) => {
    if (selectedArtists.find(a => a.id === artist.id)) return;
    if (selectedArtists.length >= 5) return;
    setSelectedArtists([...selectedArtists, {
      id: artist.id,
      name: artist.name,
      image_url: artist.images?.[0]?.url
    }]);
    setSearchQuery('');
    setSearchResults([]);
  };

  const removeArtist = (id) => {
    setSelectedArtists(selectedArtists.filter(a => a.id !== id));
  };

  const handleOnboardingSubmit = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          favorite_genres: selectedGenres,
          favorite_artists: selectedArtists
        })
        .eq('id', userId);

      if (error) throw error;

      setSuccess(true);
      const returnTo = location.state?.returnTo || '/explore';
      setTimeout(() => navigate(returnTo), 2000);
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT HALF: Animated Collage */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-[#050508] border-r border-white/5">
        <div className="absolute inset-0 bg-gradient-to-tr from-secondary/20 to-primary/20 z-10 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_100%)] z-20 pointer-events-none"></div>
        
        <div className="absolute inset-0 opacity-50">
          <div className="absolute top-[20%] left-[10%] w-56 h-56 bg-surface2 rounded-xl -rotate-12 animate-float shadow-2xl" style={{ animationDelay: '-1s' }}>
            <img src="https://images.unsplash.com/photo-1598387993441-a364f854c3e1?auto=format&fit=crop&q=80&w=400" alt="Album" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="absolute top-[50%] left-[55%] w-60 h-60 bg-surface2 rounded-xl rotate-12 animate-float shadow-2xl" style={{ animationDelay: '-3s' }}>
             <img src="https://images.unsplash.com/photo-1619983081563-430f63602796?auto=format&fit=crop&q=80&w=400" alt="Album" className="w-full h-full object-cover rounded-xl" />
          </div>
          <div className="absolute top-[70%] left-[15%] w-48 h-48 bg-surface2 rounded-xl -rotate-6 animate-float shadow-2xl" style={{ animationDelay: '-5s' }}>
             <img src="https://images.unsplash.com/photo-1493225457124-a1a2a5f5f46a?auto=format&fit=crop&q=80&w=400" alt="Album" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </div>

      {/* RIGHT HALF: Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-24 relative overflow-y-auto z-10">
        <HeroOrbs />
        
        <div className="w-full max-w-md mx-auto py-8 animate-fade-in-up">
          <div className="mb-10 text-center lg:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-8">
              <Music className="w-8 h-8 text-secondary" />
              <span className="font-display font-bold text-2xl text-white">BeatFrame</span>
            </Link>
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-white tracking-tight mb-3">
              {step === 1 ? <>Join <GradientText>BeatFrame</GradientText></> : <>Your <GradientText>Taste</GradientText></>}
            </h2>
            <p className="text-[#94a3b8] font-medium text-lg">
              {step === 1 ? 'Start reviewing music you love.' : 'Personalize your concert experience.'}
            </p>
          </div>

          {success ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-secondary/20 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <Check className="w-12 h-12 text-secondary" />
              </div>
              <h3 className="font-display text-3xl font-bold text-white mb-3">Profile Complete!</h3>
              <p className="text-[#94a3b8] text-lg">Taking you to explore...</p>
            </div>
          ) : step === 1 ? (
            /* STEP 1: SIGNUP FORM */
            <form className="space-y-6" onSubmit={handleSignupSubmit}>
              {errors.submit && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-sm text-center">
                  {errors.submit}
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div className="relative group">
                  <input id="fullName" name="fullName" type="text" value={formData.fullName} onChange={handleChange} onBlur={handleBlur} required
                    className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 text-white placeholder-transparent focus:ring-0 focus:border-transparent peer" placeholder="Full Name" />
                  <label htmlFor="fullName" className="absolute left-0 -top-3.5 text-sm text-[#94a3b8] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary font-medium pointer-events-none">Full Name</label>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 peer-focus:w-full"></div>
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
                </div>
                <div className="relative group">
                  <input id="username" name="username" type="text" value={formData.username} onChange={handleChange} onBlur={handleBlur} required
                    className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 pr-8 text-white placeholder-transparent focus:ring-0 focus:border-transparent peer" placeholder="Username" />
                  <label htmlFor="username" className="absolute left-0 -top-3.5 text-sm text-[#94a3b8] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary font-medium pointer-events-none">Username</label>
                  <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 peer-focus:w-full"></div>
                  
                  {/* Status Indicator */}
                  <div className="absolute right-0 top-3">
                    {checkingUsername ? (
                      <Loader2 className="w-5 h-5 text-[#94a3b8] animate-spin" />
                    ) : usernameAvailable === true ? (
                      <Check className="w-5 h-5 text-green-500" />
                    ) : usernameAvailable === false && formData.username ? (
                      <X className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>

                  {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username}</p>}
                </div>
              </div>

              <div className="relative group pt-2">
                <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required
                  className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 text-white placeholder-transparent focus:ring-0 focus:border-transparent peer" placeholder="Email" />
                <label htmlFor="email" className="absolute left-0 -top-3.5 text-sm text-[#94a3b8] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary font-medium pointer-events-none">Email address</label>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 peer-focus:w-full"></div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
              </div>

              <div className="relative group pt-2">
                <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} onBlur={handleBlur} required
                  className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 text-white placeholder-transparent focus:ring-0 focus:border-transparent peer" placeholder="Password" />
                <label htmlFor="password" className="absolute left-0 -top-3.5 text-sm text-[#94a3b8] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary font-medium pointer-events-none">Password</label>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 peer-focus:w-full"></div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>

              <div className="relative group pt-2">
                <input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} onBlur={handleBlur} required
                  className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 text-white placeholder-transparent focus:ring-0 focus:border-transparent peer" placeholder="Confirm Password" />
                <label htmlFor="confirmPassword" className="absolute left-0 -top-3.5 text-sm text-[#94a3b8] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-3 peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-primary font-medium pointer-events-none">Confirm Password</label>
                <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-primary to-secondary transition-all duration-300 peer-focus:w-full"></div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>

              {/* Math Captcha for Bot Protection */}
              <div className="relative group pt-2 flex gap-4 items-end">
                <div className="text-white font-bold pb-2 border-b-2 border-transparent w-1/2">
                  What is {captcha.num1} + {captcha.num2}?
                </div>
                <div className="relative w-1/2">
                  <input id="captcha" name="captcha" type="number" value={captchaInput} onChange={(e) => { setCaptchaInput(e.target.value); setErrors(prev => ({...prev, captcha: ''})); }} required
                    className="block w-full bg-transparent border-0 border-b-2 border-white/10 py-3 text-white placeholder-[#94a3b8] focus:ring-0 focus:border-secondary" placeholder="Answer" />
                  {errors.captcha && <p className="mt-1 text-xs text-red-500 absolute w-full">{errors.captcha}</p>}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-full font-bold text-white mt-8 bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>Continue <ArrowRight className="w-5 h-5" /></>
                )}
              </button>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-[#050508] text-[#475569]">or continue with</span>
                </div>
              </div>

              <div className="text-center">
                <Link to="/login" className="font-bold text-[#94a3b8] hover:text-white transition-colors">
                  Already have an account? <span className="text-primary">Log in</span>
                </Link>
              </div>
            </form>
          ) : (
            /* STEP 2: ONBOARDING */
            <div className="space-y-10 animate-fade-in-up">
              <div>
                <h3 className="font-display font-bold text-xl text-white mb-4">Select your favorite genres</h3>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(genre => {
                    const isSelected = selectedGenres.includes(genre);
                    return (
                      <button
                        key={genre}
                        onClick={() => toggleGenre(genre)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                          isSelected 
                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-[0_0_15px_rgba(124,58,237,0.4)] scale-105 border-transparent' 
                            : 'bg-transparent border border-white/20 text-[#94a3b8] hover:text-white hover:border-white/40'
                        }`}
                      >
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-4">
                  <h3 className="font-display font-bold text-xl text-white">Top 5 Artists</h3>
                  <span className="text-sm font-medium text-secondary">{selectedArtists.length} / 5 selected</span>
                </div>
                
                {selectedArtists.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-6">
                    {selectedArtists.map(artist => (
                      <div key={artist.id} className="group flex items-center gap-2 bg-surface1 pr-3 rounded-full border border-white/10">
                        <img src={artist.image_url || 'https://via.placeholder.com/32'} alt={artist.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="text-sm font-medium text-white">{artist.name}</span>
                        <button onClick={() => removeArtist(artist.id)} className="text-[#475569] hover:text-red-400 transition-colors ml-1">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedArtists.length < 5 && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-[#475569]" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search for an artist..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-12 pr-4 py-4 border-0 border-b-2 border-white/10 bg-transparent text-white placeholder-[#475569] focus:outline-none focus:border-secondary transition-colors"
                    />
                    
                    {searchError && (
                      <p className="mt-2 text-xs text-red-400">{searchError}</p>
                    )}
                    
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-2 bg-surface1 border border-white/10 rounded-xl shadow-2xl overflow-hidden">
                        {searchResults.map(artist => (
                          <button
                            key={artist.id}
                            onClick={() => addArtist(artist)}
                            className="w-full text-left flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                          >
                            <img src={artist.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={artist.name} className="w-12 h-12 rounded-full object-cover" />
                            <span className="text-white font-bold">{artist.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => handleOnboardingSubmit()}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-4 px-4 rounded-full font-bold text-white bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_20px_rgba(124,58,237,0.5)] transition-all active:scale-[0.98] disabled:opacity-70 mb-4"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>Complete Profile <Check className="w-5 h-5 ml-1" /></>
                  )}
                </button>
                <div className="text-center">
                  <button type="button" onClick={() => handleOnboardingSubmit()} className="text-sm font-medium text-[#475569] hover:text-white transition-colors">
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
