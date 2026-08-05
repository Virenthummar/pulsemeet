import React, { useState } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Star, 
  Calendar, 
  Tag, 
  Edit3, 
  CheckCircle2, 
  PhoneCall, 
  Award,
  Sparkles,
  MapPin,
  Trash2,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from '../activity/ActivityCard';
import { AvatarUploader } from './AvatarUploader';

export const ProfileView: React.FC = () => {
  const { currentUser, activities, reviews, setIsVerificationModalOpen, setSelectedActivityId, updateUserProfile, deleteUserProfile } = useApp();
  const [activeTab, setActiveTab] = useState<'hosted' | 'joined' | 'reviews'>('hosted');
  const [isEditing, setIsEditing] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email || '');
  const [editBio, setEditBio] = useState(currentUser.bio);
  const [editInterests, setEditInterests] = useState(currentUser.interests.join(', '));

  const hostedActivities = activities.filter(a => a.hostId === currentUser.id);
  const joinedActivities = activities.filter(a => a.participants.some(p => p.userId === currentUser.id));
  const userReviews = reviews.filter(r => r.hostId === currentUser.id);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editName,
      email: editEmail,
      bio: editBio,
      interests: editInterests.split(',').map(i => i.trim()).filter(Boolean)
    });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Profile Banner & Info Header */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="h-20 w-20 rounded-2xl object-cover ring-2 ring-indigo-500/40 shadow-lg"
              />
              <button 
                onClick={() => setIsUploaderOpen(true)}
                className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center transition-opacity cursor-pointer"
              >
                <Camera className="h-6 w-6 text-white mb-1" />
                <span className="text-[10px] text-white font-bold text-center leading-tight">Upload<br/>Photo</span>
              </button>
              {currentUser.verified && (
                <span className="absolute -bottom-1 -right-1 h-6 w-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2 ring-slate-900 pointer-events-none z-10">
                  ✓
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100">{currentUser.name}</h2>
                {currentUser.verified ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Verified Host</span>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsVerificationModalOpen(true)}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
                  >
                    <span>Verify Account</span>
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Member since {currentUser.joinedDate} • {currentUser.email}
              </p>

              <div className="flex items-center space-x-4 pt-1 text-xs">
                <span className="flex items-center space-x-1 text-amber-400 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span>{currentUser.rating.toFixed(1)} Rating</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-semibold">{currentUser.activitiesHostedCount} Hosted</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-300 font-semibold">{currentUser.activitiesJoinedCount} Joined</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>

        </div>

        {/* Bio & Interests */}
        {!isEditing ? (
          <div className="mt-6 pt-6 border-t border-slate-800/80 space-y-4">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentUser.bio}
            </p>

            <div className="flex flex-wrap gap-2">
              {currentUser.interests.map(interest => (
                <span 
                  key={interest}
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-indigo-300 border border-slate-700/60"
                >
                  #{interest}
                </span>
              ))}
            </div>
          </div>
        ) : (
          /* Edit Profile Form */
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Display Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Short Bio</label>
              <textarea
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Interests (comma separated)</label>
              <input
                type="text"
                value={editInterests}
                onChange={(e) => setEditInterests(e.target.value)}
                className="w-full bg-slate-800 text-slate-200 p-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition-colors"
              >
                Save Profile Changes
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete profile "${currentUser.name}"? This action will permanently remove your profile, hosted hangouts, and data.`)) {
                    deleteUserProfile(currentUser.id);
                  }
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors flex items-center space-x-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Profile & Account</span>
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Tabs: Hosted / Joined / Reviews */}
      <div className="flex border-b border-slate-800 px-2 space-x-4">
        <button
          onClick={() => setActiveTab('hosted')}
          className={`pb-3 font-semibold text-xs transition-colors border-b-2 ${
            activeTab === 'hosted' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My Hosted Hangouts ({hostedActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('joined')}
          className={`pb-3 font-semibold text-xs transition-colors border-b-2 ${
            activeTab === 'joined' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Joined Hangouts ({joinedActivities.length})
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 font-semibold text-xs transition-colors border-b-2 ${
            activeTab === 'reviews' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Host Reviews ({userReviews.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'hosted' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {hostedActivities.map(act => (
            <ActivityCard key={act.id} activity={act} onSelect={setSelectedActivityId} />
          ))}
        </div>
      )}

      {activeTab === 'joined' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {joinedActivities.map(act => (
            <ActivityCard key={act.id} activity={act} onSelect={setSelectedActivityId} />
          ))}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {userReviews.map(rev => (
            <div key={rev.id} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={rev.reviewerAvatar} alt={rev.reviewerName} className="h-6 w-6 rounded-full object-cover" />
                  <span className="font-bold text-slate-200">{rev.reviewerName}</span>
                </div>
                <div className="flex items-center space-x-1 text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" />
                  <span className="font-bold">{rev.rating}/5</span>
                </div>
              </div>
              <p className="text-slate-300 italic">{rev.comment}</p>
              <p className="text-[10px] text-slate-500">{rev.timestamp}</p>
            </div>
          ))}
        </div>
      )}

      {isUploaderOpen && (
        <AvatarUploader 
          onSuccess={(url) => {
            updateUserProfile({ avatar: url });
            setIsUploaderOpen(false);
          }}
          onCancel={() => setIsUploaderOpen(false)}
        />
      )}
    </div>
  );
};
