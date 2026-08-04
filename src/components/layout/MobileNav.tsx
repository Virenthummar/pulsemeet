import React from 'react';
import { Compass, Map, Plus, MessageSquare, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface MobileNavProps {
  currentTab: 'explore' | 'chats' | 'profile';
  setCurrentTab: (tab: 'explore' | 'chats' | 'profile') => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, setCurrentTab }) => {
  const { filters, setFilters, setIsCreateModalOpen, chatMessages } = useApp();

  // Total messages count indicator
  const totalChatCount = Object.keys(chatMessages).length;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 shadow-2xl">
      <div className="flex items-center justify-between max-w-md mx-auto">
        
        {/* Explore Feed */}
        <button
          onClick={() => {
            setCurrentTab('explore');
            setFilters(prev => ({ ...prev, viewMode: 'list' }));
          }}
          className={`flex flex-col items-center space-y-1 transition-colors ${
            currentTab === 'explore' && filters.viewMode === 'list' 
              ? 'text-indigo-400 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px]">Explore</span>
        </button>

        {/* Map View */}
        <button
          onClick={() => {
            setCurrentTab('explore');
            setFilters(prev => ({ ...prev, viewMode: 'map' }));
          }}
          className={`flex flex-col items-center space-y-1 transition-colors ${
            currentTab === 'explore' && filters.viewMode === 'map' 
              ? 'text-indigo-400 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="h-5 w-5" />
          <span className="text-[10px]">Map View</span>
        </button>

        {/* Floating Quick Create Button */}
        <div className="-mt-6">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 transform active:scale-95 transition-transform border-2 border-slate-900"
          >
            <Plus className="h-6 w-6 stroke-[3]" />
          </button>
        </div>

        {/* Group Chats */}
        <button
          onClick={() => setCurrentTab('chats')}
          className={`flex flex-col items-center space-y-1 transition-colors relative ${
            currentTab === 'chats' 
              ? 'text-indigo-400 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="h-5 w-5" />
          <span className="text-[10px]">Chats</span>
          {totalChatCount > 0 && (
            <span className="absolute top-0 right-1 h-2 w-2 bg-indigo-500 rounded-full"></span>
          )}
        </button>

        {/* Profile */}
        <button
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center space-y-1 transition-colors ${
            currentTab === 'profile' 
              ? 'text-indigo-400 font-semibold' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px]">Profile</span>
        </button>

      </div>
    </nav>
  );
};
