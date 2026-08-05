import React from 'react';
import { 
  Filter, 
  Compass, 
  MapPin, 
  Sparkles, 
  Calendar, 
  SlidersHorizontal,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Activity, ActivityCategory } from '../../types';
import { useApp } from '../../context/AppContext';
import { ActivityCard } from '../activity/ActivityCard';

interface ExploreFeedProps {
  onSelectActivity: (id: string) => void;
}

const CATEGORIES: ActivityCategory[] = [
  'Walking', 
  'Sports', 
  'Games', 
  'Food', 
  'Fitness', 
  'Study', 
  'Outdoors', 
  'Other'
];

export const ExploreFeed: React.FC<ExploreFeedProps> = ({ onSelectActivity }) => {
  const { activities, filters, setFilters, userLocation, setIsCreateModalOpen } = useApp();

  const toggleCategory = (cat: ActivityCategory) => {
    setFilters(prev => {
      const exists = prev.selectedCategories.includes(cat);
      const updated = exists 
        ? prev.selectedCategories.filter(c => c !== cat)
        : [...prev.selectedCategories, cat];
      return { ...prev, selectedCategories: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategories: [],
      maxDistanceKm: 25,
      dateRange: 'all',
      onlyAvailable: false,
      viewMode: 'list',
      sortBy: 'soonest'
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Hero Header Section */}
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Hyperlocal Meetups & Activities</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Discover <span className="bg-gradient-to-r from-amber-300 via-rose-400 to-indigo-300 bg-clip-text text-transparent">Real People & Local Vibes</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Connect with verified hosts and join spontaneous walks, games, sports, or coffee hangouts happening near you right now.
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl font-bold bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 text-white shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center space-x-2 text-xs sm:text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span>Host an Activity</span>
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setFilters(prev => ({ ...prev, selectedCategories: [] }))}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
            filters.selectedCategories.length === 0
              ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 shadow-lg shadow-amber-500/30 scale-105 font-bold'
              : 'glass-panel text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>All Categories</span>
        </button>

        {CATEGORIES.map(cat => {
          const isSelected = filters.selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white border-amber-400 shadow-lg shadow-amber-500/30 scale-105 font-bold'
                  : 'glass-panel text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Filter Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl border border-slate-800/80 shadow-lg">
        
        {/* Left: Distance & Location info */}
        <div className="flex items-center space-x-3 text-xs text-slate-300">
          <div className="flex items-center space-x-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <MapPin className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-medium text-slate-200">{userLocation.label}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Radius:</span>
            <input
              type="range"
              min="1"
              max="50"
              value={filters.maxDistanceKm}
              onChange={(e) => setFilters(prev => ({ ...prev, maxDistanceKm: Number(e.target.value) }))}
              className="w-24 accent-indigo-500 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
            />
            <span className="font-bold text-indigo-400">
              {filters.maxDistanceKm >= 50 ? '50+ km (All)' : `${filters.maxDistanceKm} km`}
            </span>
          </div>
        </div>

        {/* Right: Toggles, Sort & Clear */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Dynamic Sort Dropdown */}
          <div className="flex items-center space-x-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
            <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="soonest" className="bg-slate-900 text-slate-200">Sort: Soonest Upcoming</option>
              <option value="distance" className="bg-slate-900 text-slate-200">Sort: Nearest Distance</option>
              <option value="popular" className="bg-slate-900 text-slate-200">Sort: Most Popular</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer select-none text-slate-300">
            <input
              type="checkbox"
              checked={filters.onlyAvailable}
              onChange={(e) => setFilters(prev => ({ ...prev, onlyAvailable: e.target.checked }))}
              className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
            />
            <span>Open Spots Only</span>
          </label>

          {(filters.selectedCategories.length > 0 || filters.searchQuery || filters.onlyAvailable || filters.maxDistanceKm !== 15) && (
            <button
              onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

      </div>

      {/* Grid of Activity Cards */}
      {activities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onSelect={onSelectActivity}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 max-w-lg mx-auto space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto mb-4 border border-indigo-500/20">
            <Compass className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Clean Slate — No Fake Activities</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            All fake sample activities have been removed. Publish your real hangout (walk, badminton, board games, coffee) or switch city location to start!
          </p>
          <div className="pt-2 flex justify-center space-x-3">
            <button
              onClick={clearFilters}
              className="text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
            >
              Reset Filters
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
            >
              + Post First Activity
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
