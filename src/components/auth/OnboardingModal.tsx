import React, { useState } from 'react';
import { UserCheck, Sparkles, ShieldCheck, User as UserIcon, Mail, Tag, Check, RefreshCw } from 'lucide-react';
import { useApp, getRandomAvatar } from '../../context/AppContext';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'
];

const INTEREST_TAGS = [
  'Walking', 'Sports', 'Games', 'Food & Coffee', 'Fitness', 'Photography', 'Outdoors', 'Reading', 'Music', 'Co-working'
];

interface OnboardingModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { createCustomUser } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(() => getRandomAvatar());
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Walking', 'Outdoors']);
  const [isVerified, setIsVerified] = useState(true);

  if (!isOpen) return null;

  const toggleInterest = (tag: string) => {
    setSelectedInterests(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCustomUser(
      name.trim(),
      bio.trim() || 'Excited to explore nearby activities and meet new friends!',
      selectedInterests.join(', '),
      selectedAvatar
    );

    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/30 mx-auto">
            <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-indigo-400" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100">Create Your Profile</h2>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            No pre-filled fake accounts. Enter your real details to start hosting and joining meetups nearby!
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Avatar Selector */}
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-between px-2">
              <label className="font-semibold text-slate-300">Profile Photo</label>
              <button
                type="button"
                onClick={() => setSelectedAvatar(getRandomAvatar())}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center space-x-1"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Randomize Photo</span>
              </button>
            </div>
            <div className="flex justify-center items-center space-x-2 overflow-x-auto pb-1">
              {AVATAR_OPTIONS.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt="avatar option"
                  onClick={() => setSelectedAvatar(url)}
                  className={`h-9 w-9 rounded-full object-cover cursor-pointer border-2 transition-all flex-shrink-0 ${
                    selectedAvatar === url ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Your Full Name *</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Lee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="jordan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 pl-8 pr-3 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Short Bio */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Short Bio / What do you like doing?</label>
            <textarea
              rows={2}
              placeholder="e.g. Weekend hiker, casual tennis player, looking for study buddies!"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-800 text-slate-200 placeholder-slate-500 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Interests Pill Selector */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-300 block">Select Your Interests</label>
            <div className="flex flex-wrap gap-1.5">
              {INTEREST_TAGS.map(tag => {
                const isSelected = selectedInterests.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleInterest(tag)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow'
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

          {/* Verified Badge Checkbox */}
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-5 w-5 text-indigo-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-200 text-xs">Verify Profile Badge</p>
                <p className="text-[10px] text-slate-400">Unlocks Verified Host badge for attendee trust</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isVerified}
              onChange={(e) => setIsVerified(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 h-4 w-4"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95 text-xs"
            >
              Complete Setup & Start Exploring
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
