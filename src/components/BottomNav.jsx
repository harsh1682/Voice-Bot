import React from 'react';
import { LayoutDashboard, MessageSquare, Settings } from 'lucide-react';

const BottomNav = ({ currentView, setView }) => {
  const navItems = [
    { id: 'assistant', icon: MessageSquare, label: 'Chat' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Stats' },
    { id: 'admin', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="bg-slate-900 border-t md:border-t-0 md:border-r border-slate-800 pb-safe px-6 py-3 md:py-6 md:px-3 w-full md:w-24 md:h-full flex-shrink-0">
      <div className="flex md:flex-col justify-around md:justify-start md:gap-8 items-center h-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`group relative flex flex-col items-center gap-1 transition-all duration-300 ${
              currentView === item.id 
                ? 'text-indigo-400' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-3 rounded-xl transition-all duration-300 ${
               currentView === item.id 
               ? 'bg-indigo-500/10 md:bg-indigo-500/20 translate-y-[-4px] md:translate-y-0' 
               : 'bg-transparent group-hover:bg-slate-800'
            }`}>
              <item.icon className={`w-6 h-6 md:w-7 md:h-7 ${currentView === item.id ? 'stroke-2' : 'stroke-[1.5]'}`} />
            </div>
            <span className="text-[10px] md:text-[11px] font-medium tracking-wide">{item.label}</span>
            
            {/* Indicator Dot: Bottom on mobile, Right on Desktop */}
            {currentView === item.id && (
              <span className="absolute -bottom-2 md:bottom-auto md:top-1/2 md:-right-3 md:-translate-y-1/2 w-1 h-1 md:w-1.5 md:h-8 bg-indigo-500 rounded-full md:rounded-l-full shadow-[0_0_8px_2px_rgba(99,102,241,0.5)]"></span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;