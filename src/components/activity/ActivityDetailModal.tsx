import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  Users, 
  ShieldCheck, 
  Star, 
  Clock, 
  CloudRain, 
  Download, 
  Share2, 
  MessageSquare, 
  UserPlus, 
  UserMinus, 
  AlertTriangle,
  Lock,
  Unlock,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit3,
  Save,
  XCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChatView } from '../chat/ChatView';

interface ActivityDetailModalProps {
  activityId: string | null;
  onClose: () => void;
}

export const ActivityDetailModal: React.FC<ActivityDetailModalProps> = ({ activityId, onClose }) => {
  const { activities, currentUser, joinActivity, leaveActivity, deleteActivity, editActivity, reportItem, blockUser, addHostReview } = useApp();
  const [activeTab, setActiveTab] = useState<'details' | 'chat'>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDatetime, setEditDatetime] = useState('');
  const [editMaxParticipants, setEditMaxParticipants] = useState<number | ''>('');

  if (!activityId) return null;

  const activity = activities.find(a => a.id === activityId);
  if (!activity) return null;

  const isJoined = activity.participants.some(p => p.userId === currentUser.id);
  const isWaitlisted = activity.waitlist.some(p => p.userId === currentUser.id);
  const isHost = activity.hostId === currentUser.id;
  const isFull = activity.maxParticipants ? activity.participants.length >= activity.maxParticipants : false;

  const startEditing = () => {
    setEditTitle(activity.title);
    setEditDescription(activity.description);
    setEditDatetime(activity.datetime ? new Date(activity.datetime).toISOString().slice(0, 16) : '');
    setEditMaxParticipants(activity.maxParticipants || '');
    setIsEditing(true);
  };

  const saveEdits = () => {
    editActivity(activity.id, {
      title: editTitle.trim() || activity.title,
      description: editDescription.trim() || activity.description,
      datetime: editDatetime ? new Date(editDatetime).toISOString() : activity.datetime,
      maxParticipants: editMaxParticipants ? Number(editMaxParticipants) : undefined
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${activity.title}"? This action cannot be undone.`)) {
      deleteActivity(activity.id);
      onClose();
    }
  };

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const startTime = new Date(activity.datetime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = new Date(new Date(activity.datetime).getTime() + 2 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const title = encodeURIComponent(activity.title);
    const details = encodeURIComponent(activity.description);
    const location = encodeURIComponent(activity.address);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
  };

  // Generate .ics calendar download file
  const downloadIcsFile = () => {
    const startTime = new Date(activity.datetime).toISOString().replace(/-|:|\.\d\d\d/g, '');
    const endTime = new Date(new Date(activity.datetime).getTime() + 2 * 3600 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, '');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PulseMeet//Activity Event//EN
BEGIN:VEVENT
UID:${activity.id}@pulsemeet.app
DTSTAMP:${startTime}
DTSTART:${startTime}
DTEND:${endTime}
SUMMARY:${activity.title}
DESCRIPTION:${activity.description}
LOCATION:${activity.address}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${activity.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Image Bar */}
        <div className="relative h-56 sm:h-72 w-full bg-slate-950 flex-shrink-0">
          <img
            src={activity.coverImage}
            alt={activity.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-transparent" />

          {/* Top Control Buttons */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white shadow-md">
              {activity.category}
            </span>
            <div className="flex items-center space-x-2">
              {isHost && (
                <>
                  <button
                    onClick={startEditing}
                    className="p-2 rounded-full bg-indigo-600/80 hover:bg-indigo-600 text-white backdrop-blur-md transition-colors"
                    title="Edit Activity"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-rose-600/80 hover:bg-rose-600 text-white backdrop-blur-md transition-colors"
                    title="Delete Activity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: activity.title, text: activity.description, url: window.location.href });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Activity link copied to clipboard!');
                  }
                }}
                className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 backdrop-blur-md transition-colors"
                title="Share Activity"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-900 text-slate-200 backdrop-blur-md transition-colors"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white line-clamp-2">
              {activity.title}
            </h2>
          </div>
        </div>

        {/* Tab Switcher (Details vs Group Chat) */}
        <div className="flex border-b border-slate-800/80 bg-slate-900/90 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center space-x-2 ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Activity Overview</span>
          </button>
          
          {(isJoined || isHost) && (
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center space-x-2 ${
                activeTab === 'chat'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Group Chat</span>
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            </button>
          )}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'details' ? (
            <>
              {/* Inline Edit Form (Host Only) */}
              {isEditing && isHost && (
                <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-indigo-400 flex items-center space-x-2">
                      <Edit3 className="h-4 w-4" />
                      <span>Edit Activity</span>
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={saveEdits}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg transition-colors flex items-center space-x-1"
                      >
                        <Save className="h-3.5 w-3.5" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-600 transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        value={editDatetime}
                        onChange={(e) => setEditDatetime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Max Participants</label>
                      <input
                        type="number"
                        value={editMaxParticipants}
                        onChange={(e) => setEditMaxParticipants(e.target.value ? Number(e.target.value) : '')}
                        min={1}
                        className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none transition-colors"
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Host Information Card */}
              <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={activity.hostAvatar}
                      alt={activity.hostName}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-indigo-500/30"
                    />
                    {activity.hostVerified && (
                      <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-indigo-600 rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-slate-100 text-sm">{activity.hostName}</h4>
                      {activity.hostVerified && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                          Verified Host
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                      <span>{activity.hostRating.toFixed(1)} Host Rating</span>
                    </p>
                  </div>
                </div>

                {!isHost && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const stars = prompt('Rate host (1-5 stars):', '5');
                        if (!stars) return;
                        const ratingNum = Math.min(5, Math.max(1, parseInt(stars) || 5));
                        const comment = prompt('Leave a brief comment about this host:', 'Awesome host and super friendly group!');
                        if (comment) {
                          addHostReview(activity.hostId, activity.id, ratingNum, comment);
                          alert('Thank you! Your rating and review have been saved.');
                        }
                      }}
                      className="text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg transition-colors flex items-center space-x-1"
                    >
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>Rate Host</span>
                    </button>
                    <button
                      onClick={() => reportItem('user', activity.hostId, 'Suspicious profile')}
                      className="text-xs text-slate-400 hover:text-rose-400 transition-colors p-1"
                    >
                      Report
                    </button>
                  </div>
                )}
              </div>

              {/* Weather Forecast Warning Widget */}
              {activity.weather && (
                <div className={`p-4 rounded-2xl border flex items-center space-x-3 ${
                  activity.weather.isOutdoorWarning
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300'
                }`}>
                  <CloudRain className="h-6 w-6 flex-shrink-0" />
                  <div className="text-xs">
                    <p className="font-bold">
                      Weather Forecast: {activity.weather.temp}°C, {activity.weather.condition}
                    </p>
                    {activity.weather.warningText && (
                      <p className="text-[11px] mt-0.5 text-amber-200">{activity.weather.warningText}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Date & Time</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">
                      {new Date(activity.datetime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at {new Date(activity.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">Group Capacity</p>
                    <p className="text-sm font-bold text-slate-200 mt-0.5">
                      {activity.participants.length} Joined {activity.maxParticipants ? `/ ${activity.maxParticipants} max` : '(Unlimited)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Meeting Point & Safety Location Release */}
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <span>Meeting Location</span>
                  </span>
                  {(isJoined || isHost) ? (
                    <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      <Unlock className="h-3 w-3" />
                      <span>Exact Location Unlocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      <Lock className="h-3 w-3" />
                      <span>Approximate Location Only</span>
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-slate-200">
                  {activity.approxLocation}
                </p>

                {(isJoined || isHost) ? (
                  <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                    <p className="font-bold flex items-center space-x-1">
                      <span>Exact Meeting Point:</span>
                    </p>
                    <p>{activity.exactMeetingPoint}</p>
                    <p className="text-[11px] text-emerald-300 font-mono mt-1">{activity.address}</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Join this hangout to reveal the exact meeting point details for privacy & safety.
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  About this Hangout
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                  {activity.description}
                </p>
              </div>

              {/* Joined Participants */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Participants ({activity.participants.length})
                  </h4>
                  {activity.waitlist.length > 0 && (
                    <span className="text-xs text-amber-400 font-semibold">
                      Waitlist: {activity.waitlist.length} waiting
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activity.participants.map((p) => (
                    <div 
                      key={p.userId} 
                      className="flex items-center justify-between bg-slate-800/40 p-3 rounded-xl border border-slate-800"
                    >
                      <div className="flex items-center space-x-2.5">
                        <img
                          src={p.userAvatar}
                          alt={p.userName}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-200 flex items-center space-x-1">
                            <span>{p.userName}</span>
                            {p.userId === activity.hostId && (
                              <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-1 rounded">Host</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">Joined {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendar Export Links */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
                <span className="text-xs text-slate-400 font-semibold">Export to Calendar:</span>
                <button
                  onClick={downloadIcsFile}
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>.ICS File</span>
                </button>
                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-400 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>Google Calendar</span>
                </a>
              </div>
            </>
          ) : (
            /* Group Chat Tab */
            <ChatView activityId={activity.id} />
          )}
        </div>

        {/* Modal Footer RSVP Buttons */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div>
            {isJoined ? (
              <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                <span>You are going to this meetup!</span>
              </span>
            ) : isWaitlisted ? (
              <span className="text-xs text-amber-400 font-bold">
                You are on the waitlist (#1 spot)
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                {isFull ? 'Hangout is full. Join waitlist for opening!' : 'Free to join — casual hangout'}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            {isJoined || isWaitlisted ? (
              <button
                onClick={() => leaveActivity(activity.id)}
                className="text-xs font-semibold text-rose-400 hover:bg-rose-500/10 px-4 py-2 rounded-xl border border-rose-500/20 transition-colors"
              >
                Cancel My Spot
              </button>
            ) : (
              <button
                onClick={() => joinActivity(activity.id)}
                className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition-all transform active:scale-95"
              >
                {isFull ? 'Join Waitlist' : 'One-Tap Join Hangout'}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
