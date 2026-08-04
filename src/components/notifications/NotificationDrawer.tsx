import React from 'react';
import { X, Bell, Check, Trash2, Calendar, MessageSquare, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationDrawer: React.FC = () => {
  const { 
    isNotificationDrawerOpen, 
    setIsNotificationDrawerOpen, 
    notifications, 
    markNotificationAsRead, 
    clearAllNotifications,
    setSelectedActivityId
  } = useApp();

  if (!isNotificationDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-sm">Notifications</h3>
            </div>
            <div className="flex items-center space-x-2">
              {notifications.length > 0 && (
                <button
                  onClick={clearAllNotifications}
                  className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center space-x-1"
                  title="Clear all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* List Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No notifications right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    if (notif.activityId) {
                      setSelectedActivityId(notif.activityId);
                      setIsNotificationDrawerOpen(false);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer space-y-1 text-xs ${
                    notif.read 
                      ? 'bg-slate-900/40 border-slate-800/80 text-slate-400' 
                      : 'bg-indigo-500/10 border-indigo-500/30 text-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100">{notif.title}</span>
                    <span className="text-[10px] text-slate-500">{notif.timestamp}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{notif.message}</p>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
