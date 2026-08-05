import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { ExploreFeed } from './components/explore/ExploreFeed';
import { MapView } from './components/explore/MapView';
import { ActivityDetailModal } from './components/activity/ActivityDetailModal';
import { CreateActivityModal } from './components/activity/CreateActivityModal';
import { ProfileView } from './components/profile/ProfileView';
import { SafetyModal } from './components/safety/SafetyModal';
import { NotificationDrawer } from './components/notifications/NotificationDrawer';
import { OnboardingModal } from './components/auth/OnboardingModal';
import { ChatView } from './components/chat/ChatView';
import { ConnectionsView } from './components/connections/ConnectionsView';
import { NotificationSettingsView } from './components/settings/NotificationSettingsView';
import { HangoutFeedbackModal } from './components/activity/HangoutFeedbackModal';
import { ThreeBackground } from './components/common/ThreeBackground';
import { MessageSquare, Users } from 'lucide-react';
import { Activity } from './types';

export const AppContent: React.FC = () => {
  const { 
    activities, 
    filters, 
    selectedActivityId, 
    setSelectedActivityId,
    currentUser
  } = useApp();

  const [currentTab, setCurrentTab] = useState<'explore' | 'chats' | 'profile' | 'connections' | 'settings'>('explore');
  const [selectedChatActivityId, setSelectedChatActivityId] = useState<string | null>(null);
  const [activityToReview, setActivityToReview] = useState<Activity | null>(null);

  // Evaluate if there are past activities to review (>24h old)
  React.useEffect(() => {
    const reviewed = JSON.parse(localStorage.getItem('pulse_meet_reviewed_signals') || '{}');
    const pastUnreviewed = activities.find(act => {
      // Must be participant or host
      const isPart = act.hostId === currentUser.id || act.participants.some(p => p.userId === currentUser.id);
      if (!isPart) return false;
      if (reviewed[act.id]) return false;
      
      const hoursSince = (Date.now() - new Date(act.datetime).getTime()) / (1000 * 60 * 60);
      return hoursSince >= 24; // Ended > 24h ago
    });
    if (pastUnreviewed) {
      setActivityToReview(pastUnreviewed);
    }
  }, [activities, currentUser.id]);

  const joinedOrHostedActivities = activities.filter(a => 
    a.hostId === currentUser.id || a.participants.some(p => p.userId === currentUser.id)
  );

  return (
    <div className="relative min-h-screen transition-colors duration-300 flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      
      {/* 3D Interactive Three.js Background */}
      <ThreeBackground />

      {/* Rich Multi-Color Ambient Radial Glows (Emerald, Teal, Azure) */}
      <div className="fixed top-[-10%] left-[-10%] w-[55vw] h-[55vw] bg-emerald-600/20 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse-glow" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] bg-teal-600/20 rounded-full blur-[150px] pointer-events-none z-0 animate-pulse-glow" style={{ animationDelay: '2s' }} />
      <div className="fixed top-[40%] right-[20%] w-[35vw] h-[35vw] bg-cyan-600/15 rounded-full blur-[140px] pointer-events-none z-0 animate-pulse-glow" style={{ animationDelay: '4s' }} />

      {/* Top Header Navbar */}
      <div className="relative z-20">
        <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      </div>

      {/* Main Page Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-8">
        {currentTab === 'explore' && (
          filters.viewMode === 'list' ? (
            <ExploreFeed onSelectActivity={setSelectedActivityId} />
          ) : (
            <MapView activities={activities} onSelectActivity={setSelectedActivityId} />
          )
        )}

        {currentTab === 'chats' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-4">
              <MessageSquare className="h-6 w-6 text-indigo-400" />
              <div>
                <h2 className="font-extrabold text-xl text-slate-100">My Activity Group Chats</h2>
                <p className="text-xs text-slate-400">Coordinate and chat with fellow attendees</p>
              </div>
            </div>

            {joinedOrHostedActivities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Chat list selector sidebar */}
                <div className="space-y-2 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Your Active Meetups ({joinedOrHostedActivities.length})
                  </h4>
                  {joinedOrHostedActivities.map(act => (
                    <button
                      key={act.id}
                      onClick={() => setSelectedChatActivityId(act.id)}
                      className={`w-full text-left p-3 rounded-xl transition-all border flex items-center space-x-3 ${
                        (selectedChatActivityId === act.id || (!selectedChatActivityId && joinedOrHostedActivities[0].id === act.id))
                          ? 'bg-indigo-600/20 border-indigo-500 text-slate-100 font-semibold'
                          : 'bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <img src={act.coverImage} alt={act.title} className="h-10 w-10 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate">{act.title}</p>
                        <p className="text-[10px] text-slate-400">{act.participants.length} attendees</p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Selected Chat Box */}
                <div className="md:col-span-2">
                  <ChatView activityId={selectedChatActivityId || joinedOrHostedActivities[0].id} />
                </div>

              </div>
            ) : (
              <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 max-w-md mx-auto">
                <Users className="h-10 w-10 text-slate-500 mx-auto mb-3" />
                <h4 className="font-bold text-slate-200">No active group chats</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Join or host a hangout to unlock its group chat room!
                </p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'profile' && (
          <ProfileView />
        )}

        {currentTab === 'connections' && (
          <ConnectionsView />
        )}

        {currentTab === 'settings' && (
          <NotificationSettingsView onBack={() => setCurrentTab('profile')} />
        )}
      </main>

      {/* Sticky Bottom Nav Bar for Mobile */}
      <MobileNav currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Global Modals & Drawers */}
      <OnboardingModal isOpen={currentUser.name === 'New User'} />
      <ActivityDetailModal 
        activityId={selectedActivityId} 
        onClose={() => setSelectedActivityId(null)} 
      />
      {activityToReview && (
        <HangoutFeedbackModal 
          activity={activityToReview} 
          onClose={() => setActivityToReview(null)} 
        />
      )}
      <CreateActivityModal />
      <SafetyModal />
      <NotificationDrawer />

    </div>
  );
};
