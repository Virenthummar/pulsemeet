import React, { useState } from 'react';
import { 
  Compass, 
  Map, 
  PlusCircle, 
  Bell, 
  ShieldCheck, 
  Search, 
  MapPin, 
  UserCheck, 
  Sparkles,
  MessageSquare,
  Sun,
  Moon,
  Users,
  ChevronDown,
  UserPlus,
  Heart
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavbarProps {
  currentTab: 'explore' | 'chats' | 'profile' | 'connections' | 'settings';
  setCurrentTab: (tab: 'explore' | 'chats' | 'profile' | 'connections' | 'settings') => void;
}

const CITY_PRESETS = [
  { label: 'Ahmedabad, Gujarat', lat: 23.0225, lng: 72.5714 },
  { label: 'Surat, Gujarat', lat: 21.1702, lng: 72.8311 },
  { label: 'Vadodara, Gujarat', lat: 22.3072, lng: 73.1812 },
  { label: 'Rajkot, Gujarat', lat: 22.3039, lng: 70.8022 },
  { label: 'Gandhinagar, Gujarat', lat: 23.2156, lng: 72.6369 },
  { label: 'Bhavnagar, Gujarat', lat: 21.7645, lng: 72.1519 },
  { label: 'Jamnagar, Gujarat', lat: 22.4707, lng: 70.0577 },
  { label: 'Junagadh, Gujarat', lat: 21.5222, lng: 70.4579 },
  { label: 'Anand, Gujarat', lat: 22.5645, lng: 72.9289 },
  { label: 'Bhuj / Kutch, Gujarat', lat: 23.2420, lng: 69.6669 },
  { label: 'Vapi, Gujarat', lat: 20.3893, lng: 72.9106 },
  { label: 'Navsari, Gujarat', lat: 20.9467, lng: 72.9520 },
  { label: 'Porbandar, Gujarat', lat: 21.6417, lng: 69.6293 },
  { label: 'Mehsana, Gujarat', lat: 23.5880, lng: 72.3693 }
];

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { 
    currentUser, 
    allUsers,
    switchUser,
    createCustomUser,
    notifications, 
    filters, 
    setFilters, 
    setIsCreateModalOpen, 
    setIsNotificationDrawerOpen,
    setIsSafetyModalOpen,
    userLocation,
    setUserLocation,
    theme,
    toggleTheme
  } = useApp();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserBio, setNewUserBio] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;
    createCustomUser(newUserName, newUserBio, 'Walking, Sports, Games');
    setShowAddUser(false);
    setIsUserMenuOpen(false);
    setNewUserName('');
    setNewUserBio('');
  };

  return (
    <header className={`sticky top-0 z-40 transition-all duration-500 ${
      isScrolled ? 'py-2 px-3 sm:px-6' : 'py-0 px-0'
    }`}>
      <div className={`transition-all duration-500 rounded-2xl overflow-hidden ${
        isScrolled
          ? 'glass-panel max-w-6xl mx-auto border border-indigo-500/40 shadow-[0_20px_50px_rgba(99,102,241,0.3)] backdrop-blur-2xl transform hover:scale-[1.005]'
          : 'glass-panel border-b border-slate-800/80 shadow-2xl'
      }`}>
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-pulse-glow" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Dynamic City Location Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('explore')}>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-md shadow-indigo-500/20">
                <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Compass className="h-6 w-6 text-indigo-400 animate-pulse-slow" />
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                    PulseMeet
                  </span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    LIVE
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Location Picker (Mobile & Desktop) */}
            <div className="flex items-center space-x-1 text-[11px] sm:text-xs bg-slate-800/80 px-2 py-1 sm:px-2.5 rounded-full border border-slate-700 max-w-[140px] sm:max-w-none">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-indigo-400 flex-shrink-0" />
              <select
                value={userLocation.label}
                onChange={(e) => {
                  const preset = CITY_PRESETS.find(c => c.label === e.target.value);
                  if (preset) setUserLocation(preset);
                }}
                className="bg-transparent text-slate-200 font-semibold text-[11px] sm:text-xs focus:outline-none cursor-pointer truncate max-w-[100px] sm:max-w-none"
              >
                {CITY_PRESETS.map(c => (
                  <option key={c.label} value={c.label} className="bg-slate-900 text-slate-200">
                    📍 {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search Bar & View Mode Toggle (Desktop) */}
          <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search activities, sports, walks..."
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="w-full bg-slate-800/70 text-slate-200 placeholder-slate-400 text-sm rounded-full pl-9 pr-4 py-2 border border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* List / Map Switch */}
            <div className="flex bg-slate-800/80 p-1 rounded-full border border-slate-700/60">
              <button
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filters.viewMode === 'list' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Compass className="h-3.5 w-3.5" />
                <span>Feed</span>
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, viewMode: 'map' }))}
                className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  filters.viewMode === 'map' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                <span>Map</span>
              </button>
            </div>
          </div>

          {/* Right Action Icons & Dynamic User Switcher Menu */}
          <div className="flex items-center space-x-3">
            
            {/* Chats Button (Desktop) */}
            <button
              onClick={() => setCurrentTab('chats')}
              className={`hidden md:flex items-center space-x-1.5 p-2 rounded-full transition-colors ${currentTab === 'chats' ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              title="Group Chats"
            >
              <MessageSquare className="h-5 w-5" />
            </button>

            {/* Connections Button (Desktop & Mobile) */}
            <button
              onClick={() => setCurrentTab('connections')}
              className={`flex items-center space-x-1.5 p-2 rounded-full transition-colors relative ${currentTab === 'connections' ? 'text-rose-400 bg-rose-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}
              title="Connections"
            >
              <Heart className="h-5 w-5" />
            </button>

            {/* Create Activity Button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg shadow-indigo-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Post Activity</span>
            </button>

            {/* Safety Tips Icon */}
            <button
              onClick={() => setIsSafetyModalOpen(true)}
              title="Trust & Safety Tips"
              className="p-2 rounded-full text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors relative"
            >
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </button>

            {/* Day / Night Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors relative"
              title={theme === 'dark' ? 'Switch to Day Light Theme' : 'Switch to Night Dark Theme'}
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-400" />
              )}
            </button>

            {/* Notifications Bell */}
            <button
              onClick={() => setIsNotificationDrawerOpen(true)}
              className="p-2 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dynamic User Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-1.5 rounded-full transition-all border border-slate-700/60 hover:border-indigo-500 bg-slate-800/50"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span className="text-xs font-semibold text-slate-200 hidden lg:inline-block max-w-[100px] truncate">
                  {currentUser.name.split(' ')[0]}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* User Switcher Popup Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in duration-150 space-y-2 text-xs">
                  <div className="px-2 py-1 border-b border-slate-800 flex items-center justify-between">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Switch Profile</span>
                    <div className="flex gap-2">
                      <button onClick={() => { setCurrentTab('settings'); setIsUserMenuOpen(false); }} className="text-indigo-400 hover:underline">
                        Settings
                      </button>
                      <button onClick={() => { setCurrentTab('profile'); setIsUserMenuOpen(false); }} className="text-indigo-400 hover:underline">
                        Profile
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {allUsers.map((usr) => (
                      <div
                        key={usr.id}
                        onClick={() => {
                          switchUser(usr.id);
                          setIsUserMenuOpen(false);
                        }}
                        className={`p-2 rounded-xl flex items-center space-x-2.5 cursor-pointer transition-colors ${
                          usr.id === currentUser.id ? 'bg-indigo-600/20 text-indigo-300 font-bold border border-indigo-500/30' : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <img src={usr.avatar} alt={usr.name} className="h-7 w-7 rounded-full object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-semibold">{usr.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{usr.bio}</p>
                        </div>
                        {usr.id === currentUser.id && <span className="text-xs text-indigo-400">Active</span>}
                      </div>
                    ))}
                  </div>

                  {/* Add New Custom Profile Trigger */}
                  {!showAddUser ? (
                    <button
                      onClick={() => setShowAddUser(true)}
                      className="w-full text-center py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                    >
                      <UserPlus className="h-3.5 w-3.5 text-indigo-400" />
                      <span>Create New Account</span>
                    </button>
                  ) : (
                    <form onSubmit={handleCreateNewUser} className="p-2 bg-slate-800/80 rounded-xl space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Your Name..."
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        className="w-full bg-slate-900 text-slate-200 p-2 rounded-lg text-xs border border-slate-700 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Short Bio..."
                        value={newUserBio}
                        onChange={(e) => setNewUserBio(e.target.value)}
                        className="w-full bg-slate-900 text-slate-200 p-2 rounded-lg text-xs border border-slate-700 focus:outline-none"
                      />
                      <div className="flex justify-end space-x-2">
                        <button type="button" onClick={() => setShowAddUser(false)} className="text-slate-400 hover:text-slate-200">Cancel</button>
                        <button type="submit" className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-lg">Create</button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </div>
  </header>
  );
};
