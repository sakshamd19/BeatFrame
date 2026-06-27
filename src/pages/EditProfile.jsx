import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2, Search, X, Check, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { searchSpotify } from '../services/spotify';

const GENRES = [
  'Hip Hop', 'Pop', 'R&B', 'Rock', 'Electronic', 
  'Indie', 'K-Pop', 'Country', 'Jazz', 'Classical', 'Metal', 'Latin'
];

export default function EditProfile() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    avatar_url: ''
  });

  const [authForm, setAuthForm] = useState({
    email: '',
    newPassword: '',
    currentPassword: ''
  });
  const [updatingAuth, setUpdatingAuth] = useState(false);
  const [authMessage, setAuthMessage] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [selectedGenres, setSelectedGenres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [searchError, setSearchError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          if (profileError.code !== 'PGRST116') throw profileError;
        }

        if (!profileData) return;

        setFormData({
          fullName: profileData.full_name || '',
          username: profileData.username || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || ''
        });
        
        setAuthForm(prev => ({ ...prev, email: user.email || '' }));
        
        setSelectedGenres(profileData.favorite_genres || []);
        setSelectedArtists(profileData.favorite_artists || []);

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Could not load profile data.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

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

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;

      setUploadingAvatar(true);
      setError(null);

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, avatar_url: data.publicUrl }));
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setError('Error uploading image. Make sure the avatars bucket is public.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Basic validation
    if (!formData.username) {
      setError("Username cannot be empty");
      setSaving(false);
      return;
    }
    if (!/^[a-z0-9_]{3,20}$/.test(formData.username)) {
      setError("Username must be 3-20 characters: lowercase, numbers, underscores only");
      setSaving(false);
      return;
    }
    if (formData.bio && formData.bio.length > 500) {
      setError("Bio cannot exceed 500 characters");
      setSaving(false);
      return;
    }

    try {
      const { data: updatedData, error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.fullName,
          username: formData.username.toLowerCase(),
          bio: formData.bio,
          avatar_url: formData.avatar_url,
          favorite_genres: selectedGenres,
          favorite_artists: selectedArtists
        })
        .eq('id', user.id)
        .select();

      console.log('Update result:', updatedData, updateError);
      if (updateError) throw updateError;
      
      if (!updatedData || updatedData.length === 0) {
        throw new Error("Update failed: No rows modified. Please check your database permissions.");
      }
      
      navigate(`/profile/${formData.username.toLowerCase()}`);
    } catch (err) {
      console.error('Update error:', err);
      if (err.message?.includes('unique constraint')) {
        setError('That username is already taken.');
      } else {
        setError(`Failed to save: ${err.message || err.details || 'Unknown error'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAuthUpdate = async (e) => {
    e.preventDefault();
    if (!authForm.currentPassword) {
      setAuthMessage({ type: 'error', text: 'Current password is required to update credentials.' });
      return;
    }
    setUpdatingAuth(true);
    setAuthMessage(null);

    try {
      // 1. Re-authenticate to ensure current password is correct (Anti-Takeover)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: authForm.currentPassword
      });

      if (signInError) throw new Error('Incorrect current password.');

      // 2. Update user attributes
      const updates = {};
      if (authForm.email && authForm.email !== user.email) updates.email = authForm.email;
      if (authForm.newPassword) {
        if (authForm.newPassword.length < 8) throw new Error('New password must be at least 8 characters');
        updates.password = authForm.newPassword;
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase.auth.updateUser(updates);
        if (updateError) throw updateError;
        setAuthMessage({ type: 'success', text: 'Credentials updated. Check your email to confirm changes if applicable.' });
        setAuthForm(prev => ({ ...prev, newPassword: '', currentPassword: '' }));
      } else {
        setAuthMessage({ type: 'error', text: 'No changes provided.' });
      }
    } catch (err) {
      setAuthMessage({ type: 'error', text: err.message });
    } finally {
      setUpdatingAuth(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    setError(null);
    try {
      const { error: rpcError } = await supabase.rpc('delete_user');
      if (rpcError) {
        throw new Error("Could not delete account. If you just created the app, you may need to run the delete_account_rpc.sql script in Supabase.");
      }
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error("Delete account error:", err);
      setError(err.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0a0a0a]">
      <Loader2 className="w-8 h-8 text-[#8b5cf6] animate-spin" />
    </div>
  );

  return (
    <div className="bg-[#0a0a0a] min-h-[calc(100vh-4rem)] py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="text-3xl font-bold text-white mb-8">Edit Profile</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-md mb-8">
            {error}
          </div>
        )}

        {/* Account Security Section */}
        <form onSubmit={handleAuthUpdate} className="mb-12 bg-[#141414] border border-red-500/20 rounded-xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/20">SECURITY</div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Account Credentials</h2>
          <p className="text-sm text-[#9ca3af] mb-6">Update your login email or password. Requires current password verification.</p>
          
          {authMessage && (
            <div className={`p-4 rounded-md text-sm border ${authMessage.type === 'success' ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
              {authMessage.text}
            </div>
          )}

          <div className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2" htmlFor="authEmail">Email Address</label>
              <input 
                id="authEmail" type="email" 
                value={authForm.email} 
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full px-4 py-3 border border-[#27272a] rounded-lg bg-[#0a0a0a] text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#9ca3af] mb-2" htmlFor="newPassword">New Password (optional)</label>
              <input 
                id="newPassword" type="password" 
                value={authForm.newPassword} 
                onChange={(e) => setAuthForm({...authForm, newPassword: e.target.value})}
                placeholder="Leave blank to keep current"
                className="w-full px-4 py-3 border border-[#27272a] rounded-lg bg-[#0a0a0a] text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            <div className="border-t border-[#27272a] pt-6">
              <label className="block text-sm font-medium text-white mb-2" htmlFor="currentPassword">Current Password (Required)</label>
              <input 
                id="currentPassword" type="password" 
                value={authForm.currentPassword} 
                onChange={(e) => setAuthForm({...authForm, currentPassword: e.target.value})}
                required
                placeholder="Verify it's you"
                className="w-full px-4 py-3 border border-red-500/30 rounded-lg bg-red-950/10 text-white focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={updatingAuth}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {updatingAuth && <Loader2 className="w-4 h-4 animate-spin" />}
              Update Credentials
            </button>
          </div>
        </form>

        <form onSubmit={handleSave} className="space-y-12">
          
          {/* Basic Info Section */}
          <div className="bg-[#141414] border border-[#27272a] rounded-xl p-6 md:p-8">
            <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>
            
            <div className="flex flex-col sm:flex-row items-center gap-8 mb-8">
              <div className="relative group cursor-pointer shrink-0">
                {formData.avatar_url ? (
                  <img src={formData.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-[#27272a]" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#27272a] flex items-center justify-center text-3xl font-bold text-[#6b7280]">
                    {formData.fullName ? formData.fullName.charAt(0) : formData.username?.charAt(0)}
                  </div>
                )}
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  {uploadingAvatar ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Change'}
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={uploadingAvatar} />
                </label>
              </div>
              <div className="text-sm text-[#9ca3af] text-center sm:text-left">
                <p>Upload a new profile picture.</p>
                <p>Square images work best.</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2" htmlFor="fullName">Full Name</label>
                <input 
                  id="fullName" type="text" 
                  value={formData.fullName} 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-3 border border-[#27272a] rounded-lg bg-[#0a0a0a] text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2" htmlFor="username">Username</label>
                <input 
                  id="username" type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                  className="w-full px-4 py-3 border border-[#27272a] rounded-lg bg-[#0a0a0a] text-white focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#9ca3af] mb-2" htmlFor="bio">Bio</label>
                <textarea 
                  id="bio" rows={4}
                  maxLength={500}
                  value={formData.bio} 
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell the world about your music taste..."
                  className="w-full px-4 py-3 border border-[#27272a] rounded-lg bg-[#0a0a0a] text-white placeholder-[#6b7280] focus:outline-none focus:border-[#8b5cf6] transition-colors resize-none"
                />
                <div className="text-right mt-1 text-xs text-[#6b7280]">
                  {formData.bio.length}/500
                </div>
              </div>


            </div>
          </div>

          {/* Music Taste Section */}
          <div className="bg-[#141414] border border-[#27272a] rounded-xl p-6 md:p-8 space-y-8">
            <h2 className="text-xl font-bold text-white mb-6">Your Taste</h2>
            
            {/* Genres */}
            <div>
              <h3 className="text-sm font-medium text-[#9ca3af] mb-4">Top Genres</h3>
              <div className="flex flex-wrap gap-2">
                {GENRES.map(genre => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre} type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isSelected 
                          ? 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/20' 
                          : 'bg-[#27272a] text-[#9ca3af] hover:text-white hover:bg-[#3f3f46]'
                      }`}
                    >
                      {genre}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Artists */}
            <div>
              <div className="flex justify-between items-end mb-4">
                <h3 className="text-sm font-medium text-[#9ca3af]">Top 5 Artists</h3>
                <span className="text-xs text-[#9ca3af]">{selectedArtists.length} / 5 selected</span>
              </div>
              
              {selectedArtists.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4 p-4 bg-[#0a0a0a] rounded-lg border border-[#27272a]">
                  {selectedArtists.map(artist => (
                    <div key={artist.id} className="group flex items-center gap-2 bg-[#1a1a1a] pr-3 rounded-full border border-[#27272a]">
                      <img src={artist.image_url || 'https://via.placeholder.com/32'} alt={artist.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm font-medium text-[#d1d5db]">{artist.name}</span>
                      <button type="button" onClick={() => removeArtist(artist.id)} className="text-[#6b7280] hover:text-red-400 transition-colors ml-1">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selectedArtists.length < 5 && (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-[#6b7280]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for an artist..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-3 border border-[#27272a] rounded-lg bg-[#0a0a0a] text-white placeholder-[#6b7280] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                  />
                  
                  {searchError && (
                    <p className="mt-2 text-xs text-red-400">{searchError}</p>
                  )}

                  {searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-2 bg-[#1a1a1a] border border-[#27272a] rounded-lg shadow-xl overflow-hidden">
                      {searchResults.map(artist => (
                        <button
                          key={artist.id} type="button"
                          onClick={() => addArtist(artist)}
                          className="w-full text-left flex items-center gap-3 p-3 hover:bg-[#27272a] transition-colors"
                        >
                          <img src={artist.images?.[0]?.url || 'https://via.placeholder.com/40'} alt={artist.name} className="w-10 h-10 rounded-full object-cover" />
                          <span className="text-white font-medium">{artist.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/profile/${formData.username}`)}
              className="px-6 py-3 text-[#9ca3af] hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#8b5cf6] hover:bg-[#7c3aed] text-white rounded-lg font-bold transition-colors shadow-lg shadow-[#8b5cf6]/20 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save Changes
            </button>
          </div>
          
        </form>

        {/* Danger Zone */}
        <div className="mt-12 bg-[#141414] border border-red-500/20 rounded-xl p-6 md:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <div className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded border border-red-500/20">DANGER</div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Delete Account</h2>
          <p className="text-sm text-[#9ca3af] mb-6">Once you delete your account, there is no going back. Please be certain.</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-500 rounded-lg font-bold transition-colors"
          >
            Delete My Account
          </button>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-[#141414] border border-red-500/20 rounded-xl p-8 max-w-md w-full shadow-2xl relative animate-fade-in-up">
            <h3 className="font-display font-bold text-2xl text-white mb-4">Are you absolutely sure?</h3>
            <p className="text-[#9ca3af] mb-8">
              This action cannot be undone. This will permanently delete your account, your profile, and all of your reviews.
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deletingAccount}
                className="px-6 py-3 bg-surface2 hover:bg-[#27272a] text-white rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingAccount ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Yes, delete my account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
