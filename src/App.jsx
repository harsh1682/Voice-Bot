import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import AssistantView from './components/AssistantView';
import DashboardView from './components/DashboardView';
import AdminView from './components/AdminView';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('assistant');
  const [settings, setSettings] = useState({ rate: 1, pitch: 1, volume: 1 });

  // 1. Setup "Virtual" User (Replaces Firebase Auth)
  useEffect(() => {
    // Check if we already have an ID for this user in the browser
    let storedUid = localStorage.getItem('voice_bot_uid');
    
    if (!storedUid) {
      // Generate a random ID if one doesn't exist
      storedUid = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('voice_bot_uid', storedUid);
    }

    // Set the user state so the rest of the app knows who is "logged in"
    setUser({ uid: storedUid });
  }, []);

  // 2. Load Settings from Local Browser Storage
  useEffect(() => {
    const savedSettings = localStorage.getItem('voice_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error("Error parsing settings", e);
      }
    }
  }, []);

  // 3. Save Settings when they change
  const updateSettings = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('voice_settings', JSON.stringify(newSettings));
  };

  // 4. View Switcher Logic
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView user={user} />;
      case 'admin': return <AdminView user={user} settings={settings} updateSettings={updateSettings} />;
      default: return <AssistantView user={user} settings={settings} />;
    }
  };

  const getTitle = () => {
    switch(currentView) {
      case 'dashboard': return 'Analytics Hub';
      case 'admin': return 'System Config';
      default: return 'VOICE BOT';
    }
  };

  // Loading State
  if (!user) return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        <p className="text-indigo-400 font-mono text-sm animate-pulse">Initializing Local System...</p>
      </div>
    </div>
  );

  return (
    // Main Container: Responsive (Column on Mobile, Row on Desktop)
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 font-sans text-slate-100 overflow-hidden">
      
      {/* Navigation: Bottom on Mobile, Left Sidebar on Desktop */}
      <div className="order-last md:order-first z-30">
        <BottomNav currentView={currentView} setView={setCurrentView} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden min-w-0">
        <Header title={getTitle()} />
        
        <main className="flex-1 overflow-hidden relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
          {renderView()}
        </main>
      </div>

    </div>
  );
}