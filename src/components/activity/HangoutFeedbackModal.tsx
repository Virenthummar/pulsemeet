import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Heart, Sparkles, UserPlus } from 'lucide-react';
import { Activity } from '../../types';

interface HangoutFeedbackModalProps {
  activity: Activity;
  onClose: () => void;
}

export const HangoutFeedbackModal: React.FC<HangoutFeedbackModalProps> = ({ activity, onClose }) => {
  const { currentUser, submitHangoutSignal, allUsers } = useApp();
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get everyone except current user
  const otherParticipants = activity.participants
    .filter(p => p.userId !== currentUser.id)
    .map(p => ({
      id: p.userId,
      name: p.userName,
      avatar: p.userAvatar
    }));

  if (activity.hostId !== currentUser.id && !otherParticipants.find(p => p.id === activity.hostId)) {
    otherParticipants.push({
      id: activity.hostId,
      name: activity.hostName,
      avatar: activity.hostAvatar
    });
  }

  const toggleUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) newSet.delete(userId);
      else newSet.add(userId);
      return newSet;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Submit for everyone so the prompt doesn't show again
    for (const p of otherParticipants) {
      const wantsAgain = selectedUserIds.has(p.id);
      await submitHangoutSignal(p.id, activity.id, wantsAgain);
    }
    
    // Mark as reviewed in localStorage so it doesn't prompt again
    const reviewed = JSON.parse(localStorage.getItem('pulse_meet_reviewed_signals') || '{}');
    reviewed[activity.id] = true;
    localStorage.setItem('pulse_meet_reviewed_signals', JSON.stringify(reviewed));
    
    setIsSubmitting(false);
    onClose();
  };

  const handleSkip = () => {
    // Treat as "no" for everyone so it doesn't prompt again
    const reviewed = JSON.parse(localStorage.getItem('pulse_meet_reviewed_signals') || '{}');
    reviewed[activity.id] = true;
    localStorage.setItem('pulse_meet_reviewed_signals', JSON.stringify(reviewed));
    onClose();
  };

  if (otherParticipants.length === 0) {
    handleSkip(); // Nothing to review
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
        
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 flex flex-col justify-end">
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="absolute -top-6 -right-6 text-white/10">
            <Sparkles className="h-32 w-32" />
          </div>
          <h2 className="text-xl font-bold text-white relative z-10 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Would you hang again?
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <p className="text-sm text-slate-300">
            You recently attended <strong className="text-white">{activity.title}</strong>. 
            Select anyone you'd like to hang out with again. If they select you too, we'll unlock a private chat!
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
            {otherParticipants.map(user => {
              const isSelected = selectedUserIds.has(user.id);
              return (
                <div 
                  key={user.id}
                  onClick={() => toggleUser(user.id)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                    isSelected 
                      ? 'bg-indigo-500/20 border-indigo-500/50' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-slate-700" />
                    <span className={`font-semibold ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                      {user.name}
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-500 text-transparent'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="animate-pulse">Saving...</span>
              ) : (
                <>
                  <UserPlus className="h-5 w-5" />
                  <span>Submit Signals</span>
                </>
              )}
            </button>
            <button
              onClick={handleSkip}
              disabled={isSubmitting}
              className="w-full bg-transparent hover:bg-slate-800 text-slate-400 font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Skip for now
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
