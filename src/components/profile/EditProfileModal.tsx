import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Camera, Check, X, Sparkles, Trash2, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AvatarUploader } from './AvatarUploader';

const INTEREST_TAGS = [
  'Walking', 'Sports', 'Games', 'Food & Coffee', 'Fitness', 'Photography', 'Outdoors', 'Reading', 'Music', 'Co-working'
];

export const EditProfileModal: React.FC = () => {
  const { 
    currentUser, 
    updateUserProfile, 
    deleteUserProfile, 
    isEditProfileModalOpen, 
    setIsEditProfileModalOpen 
  } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [bio, setBio] = useState(currentUser.bio);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentUser.interests || []);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  // Sync state whenever modal opens or currentUser changes
  useEffect(() => {
    if (isEditProfileModalOpen) {
      setName(currentUser.name);
      setEmail(currentUser.email || '');
      setBio(currentUser.bio);
      setSelectedAvatar(currentUser.avatar);
      setSelectedInterests(currentUser.interests || []);
    }
  }, [isEditProfileModalOpen, currentUser]);

  if (!isEditProfileModalOpen) return null;

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUserProfile({
      name: name.trim(),
      email: email.trim(),
      bio: bio.trim(),
      avatar: selectedAvatar,
      interests: selectedInterests
    });

    setIsEditProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-amber-500/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">Edit Your Profile</h2>
              <p className="text-xs text-slate-400">Update your public details and preferences</p>
            </div>
          </div>
          <button 
            onClick={() => setIsEditProfileModalOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Avatar Selector */}
          <div className="space-y-2 text-center">
            <label className="font-semibold text-slate-300 block">Profile Photo</label>
            <div className="flex flex-col items-center justify-center space-y-3">
              <div 
                className="relative cursor-pointer group"
                onClick={() => setIsUploaderOpen(true)}
              >
                <img
                  src={selectedAvatar}
                  alt="avatar"
                  className="h-24 w-24 rounded-2xl object-cover ring-2 ring-amber-500/50 shadow-lg"
                />
                <div className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 text-white mb-1" />
                  <span className="text-[10px] text-white font-bold text-center leading-tight">Change<br/>Photo</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUploaderOpen(true)}
                className="px-3.5 py-1.5 bg-slate-800 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-slate-700 transition-colors"
              >
                Upload / Choose Photo
              </button>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Display Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Short Bio</label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Interests Pill Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Select Your Interests</label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {INTEREST_TAGS.map(tag => {
                const isSelected = selectedInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="h-3 w-3 inline mr-1" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit & Delete Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Are you sure you want to delete profile "${currentUser.name}"? This action cannot be undone.`)) {
                  deleteUserProfile(currentUser.id);
                  setIsEditProfileModalOpen(false);
                }
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center space-x-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Profile</span>
            </button>

            <button
              type="submit"
              className="flex-1 py-3 rounded-xl font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 hover:from-amber-400 hover:to-rose-400 text-white shadow-lg shadow-amber-500/25 transition-all text-xs"
            >
              Save Profile Changes
            </button>
          </div>

        </form>

      </div>

      {isUploaderOpen && (
        <AvatarUploader 
          onSuccess={(url) => {
            setSelectedAvatar(url);
            setIsUploaderOpen(false);
          }}
          onCancel={() => setIsUploaderOpen(false)}
        />
      )}
    </div>
  );
};
