
import React from 'react';
import { View } from '../types';

interface NavigationProps {
  currentView: View;
  setView: (view: View) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const tabs = [
    { id: 'HOME', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', label: 'Home' },
    { id: 'MARKET', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', label: 'Market' },
    { id: 'PORTFOLIO', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', label: 'Portfolio' },
    { id: 'AI', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z', label: 'AI Advisor' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-20 bg-zinc-900 border-t border-white/10 px-4 flex justify-around items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id as View)}
          className={`flex flex-col items-center gap-1 transition-all duration-200 ${currentView === tab.id ? 'text-blue-500 scale-110' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Navigation;
