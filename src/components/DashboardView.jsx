import React, { useState, useEffect } from 'react';
import { User, Bot, BarChart3, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const API_URL = 'http://localhost:5000/api/chats';

const DashboardView = ({ user }) => {
  const [stats, setStats] = useState({ total: 0, userCount: 0, botCount: 0 });
  const [hourlyData, setHourlyData] = useState([]);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_URL}/${user.uid}`);
        const data = await res.json();

        let uCount = 0;
        let bCount = 0;
        const hours = Array(24).fill(0).map((_, i) => ({ hour: i, count: 0 }));

        data.forEach(chat => {
          if (chat.sender === 'user') uCount++;
          else bCount++;
          
          if (chat.createdAt) {
            const date = new Date(chat.createdAt);
            hours[date.getHours()].count++;
          }
        });

        setStats({ total: data.length, userCount: uCount, botCount: bCount });
        setHourlyData(hours);
      } catch (e) {
        console.error("Dashboard fetch error:", e);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="p-6 pb-24 md:pb-8 space-y-6 overflow-y-auto h-full scrollbar-hide md:p-8 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <User className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">User Sent</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{stats.userCount}</p>
        </div>
        <div className="bg-slate-800 p-5 rounded-2xl shadow-lg border border-slate-700/50 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Bot className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Replies</span>
          </div>
          <p className="text-3xl font-bold text-slate-100">{stats.botCount}</p>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700/50 h-72 lg:h-96">
        <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          Hourly Activity
        </h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" />
            <XAxis 
                dataKey="hour" 
                tick={{fontSize: 10, fill: '#94a3b8'}} 
                interval={3} 
                tickFormatter={(h) => `${h}:00`}
                axisLine={false}
                tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                  backgroundColor: '#1e293b', 
                  borderRadius: '12px', 
                  border: '1px solid #334155', 
                  color: '#f1f5f9',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.5)'
              }}
              cursor={{fill: '#334155', opacity: 0.4}}
            />
            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardView;