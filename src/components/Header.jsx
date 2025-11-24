import React from 'react';
import { Sparkles } from 'lucide-react';

const Header = ({ title }) => (
  <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-10 px-6 py-4 flex items-center justify-between shadow-lg">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-indigo-500/20 shadow-lg">
        <Sparkles className="text-white w-5 h-5" />
      </div>
      <div>
        <h1 className="font-bold text-lg text-white tracking-tight">{title}</h1>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Online</span>
        </div>
      </div>
    </div>
  </header>
);

export default Header;