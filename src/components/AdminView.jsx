import React, { useState } from 'react';
import { Volume2, User, LogOut, Play, Activity } from 'lucide-react';
import { speakText } from '../utils/helpers';

const AdminView = ({ user, settings, updateSettings }) => {
  const [isTesting, setIsTesting] = useState(false);

  const handleTestVoice = () => {
    setIsTesting(true);
    console.log("🔊 Testing Voice with settings:", settings);
    speakText("This is a preview of my voice. How do I sound?", settings);
    
    // Reset button visual state after 2 seconds
    setTimeout(() => setIsTesting(false), 2000);
  };

  const handleLogout = () => {
    if(window.confirm("Are you sure you want to reset the session?")) {
      window.location.reload();
    }
  };

  return (
    <div className="p-6 pb-24 space-y-8 overflow-y-auto h-full scrollbar-hide max-w-4xl mx-auto">
      
      {/* Voice Configuration Card */}
      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Volume2 className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="font-semibold text-slate-100">Voice Configuration</h2>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Rate Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Speaking Rate (Speed)</label>
              <span className="text-xs font-mono bg-slate-700 text-indigo-300 px-2 py-1 rounded-md border border-slate-600">
                {settings.rate}x
              </span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={settings.rate}
              onChange={(e) => updateSettings('rate', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />
            <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Pitch Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Voice Pitch (Tone)</label>
              <span className="text-xs font-mono bg-slate-700 text-indigo-300 px-2 py-1 rounded-md border border-slate-600">
                {settings.pitch}
              </span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="2" 
              step="0.1" 
              value={settings.pitch}
              onChange={(e) => updateSettings('pitch', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
            />
             <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wider font-medium">
              <span>Deep</span>
              <span>Normal</span>
              <span>High</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
             <button 
                onClick={handleTestVoice}
                disabled={isTesting}
                className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-lg ${
                  isTesting 
                    ? 'bg-green-500/10 text-green-400 border border-green-500/50' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25 active:scale-[0.98]'
                }`}
             >
               {isTesting ? (
                 <Activity className="w-5 h-5 animate-pulse" />
               ) : (
                 <Play className="w-5 h-5 fill-current" />
               )}
               {isTesting ? "Playing Preview..." : "Test Voice Settings"}
             </button>
          </div>
        </div>
      </div>

      {/* Account Card */}
      <div className="bg-slate-800 rounded-2xl shadow-lg border border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-slate-700 rounded-lg">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-100">Account Session</h3>
        </div>
        
        <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/50">
           <p className="text-xs text-slate-500 font-mono mb-1">SESSION ID</p>
           <p className="text-xs text-slate-300 font-mono break-all">{user?.uid || "Not Connected"}</p>
        </div>

        <button 
           onClick={handleLogout}
           className="w-full py-3 text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 hover:border-red-500/30 transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Reset Session & Clear Data
        </button>
      </div>
    </div>
  );
};

export default AdminView;