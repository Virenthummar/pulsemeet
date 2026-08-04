import React from 'react';
import { X, ShieldCheck, Lock, AlertTriangle, CheckCircle, PhoneCall, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const SafetyModal: React.FC = () => {
  const { 
    isSafetyModalOpen, 
    setIsSafetyModalOpen, 
    isVerificationModalOpen, 
    setIsVerificationModalOpen,
    verifyUserPhoneAndId,
    currentUser
  } = useApp();

  if (!isSafetyModalOpen && !isVerificationModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      
      {/* Safety Tips Modal */}
      {isSafetyModalOpen && (
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
              <h3 className="font-bold text-lg text-slate-100">Trust & Safety Guidelines</h3>
            </div>
            <button
              onClick={() => setIsSafetyModalOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start space-x-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
              <Lock className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">Privacy-First Locations</h4>
                <p className="mt-0.5 text-slate-400">
                  Exact meeting spots are hidden until you officially join a hangout. Public feeds show only approximate neighborhood radii.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
              <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">Meet in Public Spaces</h4>
                <p className="mt-0.5 text-slate-400">
                  Always meet in well-lit, public locations (parks, cafes, indoor sport courts). Never share personal home addresses.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-800">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-200">One-Tap Block & Report</h4>
                <p className="mt-0.5 text-slate-400">
                  If someone behaves inappropriately, click "Report Host" or "Block User" on any activity or profile to immediately remove them from your view.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              onClick={() => setIsSafetyModalOpen(false)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* Verification Simulator Modal */}
      {isVerificationModalOpen && (
        <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-6 w-6 text-indigo-400" />
              <h3 className="font-bold text-lg text-slate-100">Get Verified Host Badge</h3>
            </div>
            <button
              onClick={() => setIsVerificationModalOpen(false)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4 text-xs text-slate-300">
            <p>
              Verifying your phone number and ID unlocks the blue <span className="font-bold text-indigo-400">Verified Host</span> badge, building trust for attendees when you post meetups.
            </p>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="flex items-center space-x-2 font-semibold text-slate-200">
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>Phone OTP Simulator (+1 555-0192)</span>
              </div>
              <input
                type="text"
                value="482910"
                readOnly
                className="w-full bg-slate-900 text-indigo-300 font-mono font-bold text-center tracking-widest p-2 rounded-lg border border-slate-700"
              />
              <p className="text-[10px] text-slate-400 text-center">
                Click verify below to complete instant verification test.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
            <button
              onClick={() => setIsVerificationModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={verifyUserPhoneAndId}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30"
            >
              Confirm & Verify
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
