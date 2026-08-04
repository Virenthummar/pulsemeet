import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Star, 
  CloudRain, 
  Clock, 
  ChevronRight,
  Sparkles,
  Trash2,
  Edit3
} from 'lucide-react';
import { Activity, ActivityCategory } from '../../types';
import { useApp } from '../../context/AppContext';

interface ActivityCardProps {
  activity: Activity;
  onSelect: (activityId: string) => void;
}

const CATEGORY_COLORS: Record<ActivityCategory, { bg: string; text: string; border: string }> = {
  Walking: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  Sports: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  Games: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  Food: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
  Fitness: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  Study: { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/20' },
  Outdoors: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onSelect }) => {
  const { currentUser, joinActivity, deleteActivity } = useApp();

  const isJoined = activity.participants.some(p => p.userId === currentUser.id);
  const isWaitlisted = activity.waitlist.some(p => p.userId === currentUser.id);
  const isHost = activity.hostId === currentUser.id;
  const isFull = activity.maxParticipants ? activity.participants.length >= activity.maxParticipants : false;

  const catStyle = CATEGORY_COLORS[activity.category] || CATEGORY_COLORS.Other;

  // Format date time into friendly string
  const eventDate = new Date(activity.datetime);
  const timeFormatted = eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateFormatted = eventDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <div 
      onClick={() => onSelect(activity.id)}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
    >
      
      {/* Top Image Section */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-950">
        <img
          src={activity.coverImage}
          alt={activity.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
            {activity.category}
          </span>
        </div>

        {/* Distance Badge */}
        {activity.distanceKm !== undefined && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/60 shadow">
              <MapPin className="h-3 w-3 text-indigo-400" />
              <span>{activity.distanceKm} km away</span>
            </span>
          </div>
        )}

        {/* Weather Warning Tag if Rain Expected */}
        {activity.weather?.isOutdoorWarning && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs bg-amber-500/90 text-slate-950 font-bold shadow-md backdrop-blur-sm">
              <CloudRain className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{activity.weather.warningText || 'Rain expected!'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        
        <div>
          {/* Title */}
          <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {activity.title}
          </h3>

          {/* Approx Location */}
          <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1">
            <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <span className="truncate">{activity.approxLocation}</span>
          </p>

          {/* Date & Time */}
          <div className="flex items-center space-x-3 mt-3 text-xs text-slate-300 bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/40">
            <div className="flex items-center space-x-1 text-indigo-400 font-medium">
              <Calendar className="h-3.5 w-3.5" />
              <span>{dateFormatted}</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center space-x-1 text-slate-300 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{timeFormatted}</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
            {activity.description}
          </p>
        </div>

        {/* Footer: Host & Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          
          {/* Host Info */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <img
                src={activity.hostAvatar}
                alt={activity.hostName}
                className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-700"
              />
              {activity.hostVerified && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[7px] font-bold">
                  ✓
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200 flex items-center space-x-1">
                <span>{activity.hostName}</span>
                {isHost && <span className="text-[10px] text-indigo-400 font-bold">(You)</span>}
              </p>
              <p className="text-[10px] text-slate-400 flex items-center space-x-0.5">
                <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                <span>{activity.hostRating.toFixed(1)}</span>
              </p>
            </div>
          </div>

          {/* Participants Capacity Badge */}
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              isFull ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300'
            }`}>
              <Users className="h-3 w-3" />
              <span>
                {activity.participants.length}
                {activity.maxParticipants ? `/${activity.maxParticipants}` : ''}
              </span>
            </span>

            {/* Quick Action Button */}
            {isHost && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${activity.title}"? This cannot be undone.`)) {
                    deleteActivity(activity.id);
                  }
                }}
                className="text-xs font-semibold text-rose-400 hover:bg-rose-500/20 p-1.5 rounded-lg transition-colors border border-rose-500/20"
                title="Delete Activity"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
            {isJoined ? (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                Joined ✓
              </span>
            ) : isWaitlisted ? (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Waitlist
              </span>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  joinActivity(activity.id);
                }}
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg transition-colors shadow-sm"
              >
                {isFull ? 'Waitlist' : 'Join'}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
