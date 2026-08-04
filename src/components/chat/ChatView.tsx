import React, { useState } from 'react';
import { Send, MessageSquare, Shield, Info, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatViewProps {
  activityId: string;
  isDirectMessage?: boolean;
}

export const ChatView: React.FC<ChatViewProps> = ({ activityId, isDirectMessage }) => {
  const { chatMessages, sendChatMessage, currentUser, activities } = useApp();
  const [inputText, setInputText] = useState('');

  const activity = activities.find(a => a.id === activityId);
  const messages = chatMessages[activityId] || [];

  const isParticipant = activity?.participants.some(p => p.userId === currentUser.id);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(activityId, inputText);
    setInputText('');
  };

  if (!isDirectMessage && !isParticipant && activity?.hostId !== currentUser.id) {
    return (
      <div className="py-12 text-center text-slate-400 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 space-y-3">
        <Lock className="h-8 w-8 text-slate-500 mx-auto" />
        <h4 className="font-bold text-slate-200 text-sm">Group Chat Locked</h4>
        <p className="text-xs max-w-xs mx-auto">
          Join this hangout to participate in the group chat and coordinate with other attendees!
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[420px] bg-slate-950/60 rounded-2xl border border-slate-800/80 overflow-hidden">
      
      {/* Chat Sub-header */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-4 w-4 text-indigo-400" />
          <span className="font-bold text-slate-200">{isDirectMessage ? 'Direct Message' : 'Activity Group Chat'}</span>
        </div>
        <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          {isDirectMessage ? 'End-to-End Encrypted' : 'Auto-archives 24h post event'}
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-8">
            No messages yet. Say hi to fellow participants! 👋
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div 
                key={msg.id}
                className={`flex items-start space-x-2.5 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="h-7 w-7 rounded-full object-cover mt-0.5"
                />
                <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end' : ''}`}>
                  <div className={`flex items-center space-x-2 text-[10px] text-slate-400 ${isMe ? 'justify-end' : ''}`}>
                    <span className="font-semibold text-slate-300">{msg.senderName}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/60'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Message Input Box */}
      <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Send a message to attendees..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 bg-slate-800/80 text-slate-200 placeholder-slate-500 text-xs rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors shadow-md"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>

    </div>
  );
};
