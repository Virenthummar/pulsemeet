import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, MessageSquare, Heart, Shield, MoreVertical } from 'lucide-react';
import { ChatView } from '../chat/ChatView';

export const ConnectionsView: React.FC = () => {
  const { currentUser, allUsers, connections } = useApp();
  const [activeDmUserId, setActiveDmUserId] = useState<string | null>(null);

  const matchedUsers = allUsers.filter(u => connections.includes(u.id));

  if (activeDmUserId) {
    const dmUser = matchedUsers.find(u => u.id === activeDmUserId);
    if (!dmUser) return null;

    // Sort IDs so the chat thread ID is consistent regardless of who opened it
    const sortedIds = [currentUser.id, dmUser.id].sort();
    const dmThreadId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    return (
      <div className="max-w-3xl mx-auto space-y-4 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveDmUserId(null)}
              className="text-sm font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              ← Back
            </button>
            <div className="flex items-center gap-3">
              <img src={dmUser.avatar} alt={dmUser.name} className="w-10 h-10 rounded-full border border-slate-700" />
              <div>
                <h3 className="font-bold text-white text-lg">{dmUser.name}</h3>
                <p className="text-xs text-indigo-400 font-medium flex items-center gap-1">
                  <Heart className="h-3 w-3 fill-indigo-400" /> Mutual Match
                </p>
              </div>
            </div>
          </div>
          <button className="text-xs text-slate-400 hover:text-rose-400 transition-colors p-2 flex items-center gap-1">
            <Shield className="h-3 w-3" /> Report
          </button>
        </div>

        <ChatView activityId={dmThreadId} isDirectMessage={true} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 text-white/5">
          <Heart className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-xl">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500" />
            Your Connections
          </h1>
          <p className="text-slate-300">
            People you've mutually agreed to hang out with again. These are private, 1:1 connections unlocked after activities.
          </p>
        </div>
      </div>

      {matchedUsers.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800/50 mb-4">
            <User className="h-8 w-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No connections yet</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            After attending activities, if both you and another participant select "Would hang again", a connection will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matchedUsers.map(user => (
            <div key={user.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition-colors group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-indigo-500/20 transition-all"></div>
              
              <div className="flex items-start justify-between relative z-10 mb-4">
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full border-2 border-indigo-500/30 object-cover" />
                <button className="text-slate-500 hover:text-slate-300">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              <div className="relative z-10">
                <h3 className="font-bold text-lg text-white mb-1 flex items-center gap-2">
                  {user.name}
                  {user.verified && <Shield className="h-3.5 w-3.5 text-indigo-400" />}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">
                  {user.bio || 'PulseMeet Member'}
                </p>
                
                <button
                  onClick={() => setActiveDmUserId(user.id)}
                  className="w-full py-2.5 px-4 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 font-semibold rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2 group-hover:bg-indigo-600 group-hover:text-white"
                >
                  <MessageSquare className="h-4 w-4" />
                  Message
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
