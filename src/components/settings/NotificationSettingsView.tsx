import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, MapPin, Tag, Check, ArrowLeft } from 'lucide-react';
import { ActivityCategory } from '../../types';

export const NotificationSettingsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentUser, updateUserProfile, userLocation } = useApp();

  const [emailEnabled, setEmailEnabled] = useState(
    currentUser.notificationSettings?.emailNewNearbyPosts ?? true
  );
  const [radiusKm, setRadiusKm] = useState(
    currentUser.notificationSettings?.radiusKm ?? 5
  );
  const [categories, setCategories] = useState<string[]>(
    currentUser.notificationSettings?.categories || currentUser.interests || []
  );

  const [isSaved, setIsSaved] = useState(false);

  const ALL_CATEGORIES: ActivityCategory[] = [
    'Walking', 'Sports', 'Games', 'Food', 'Fitness', 'Study', 'Outdoors', 'Other'
  ];

  const toggleCategory = (cat: string) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    setIsSaved(false);
  };

  const handleSave = () => {
    updateUserProfile({
      notificationSettings: {
        emailNewNearbyPosts: emailEnabled,
        radiusKm,
        categories
      }
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 animate-fade-in">
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bell className="h-6 w-6 text-indigo-400" />
          Notification Settings
        </h1>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8">
        
        {/* Toggle Emails */}
        <div className="flex items-start justify-between">
          <div className="space-y-1 pr-4">
            <h3 className="text-lg font-bold text-white">Nearby Meetup Emails</h3>
            <p className="text-sm text-slate-400">
              Receive a digest email when new activities are posted near your active location.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
            <input 
              type="checkbox" 
              checked={emailEnabled} 
              onChange={(e) => {
                setEmailEnabled(e.target.checked);
                setIsSaved(false);
              }} 
              className="sr-only peer" 
            />
            <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        <hr className="border-slate-800" />

        {/* Radius Slider */}
        <div className={`space-y-4 transition-opacity ${!emailEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-rose-400" />
              <h3 className="font-bold text-white">Notification Radius</h3>
            </div>
            <span className="text-indigo-400 font-bold">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={radiusKm}
            onChange={(e) => {
              setRadiusKm(Number(e.target.value));
              setIsSaved(false);
            }}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
          <p className="text-xs text-slate-500 text-center">
            You will only be emailed about activities within this distance of {userLocation.label || 'your active city'}.
          </p>
        </div>

        <hr className="border-slate-800" />

        {/* Category Filters */}
        <div className={`space-y-4 transition-opacity ${!emailEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center space-x-2">
            <Tag className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-white">Categories Filter</h3>
          </div>
          <p className="text-sm text-slate-400">
            Only notify me about these types of activities. (Select at least one)
          </p>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                  categories.includes(cat)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={isSaved || (emailEnabled && categories.length === 0)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold transition-all"
          >
            {isSaved ? (
              <>
                <Check className="h-5 w-5" /> Saved
              </>
            ) : (
              'Save Preferences'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
