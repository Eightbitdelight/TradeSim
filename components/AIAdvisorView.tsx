
import React from 'react';
import { AIAdvice } from '../types';

interface AIAdvisorViewProps {
  advices: AIAdvice[];
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const AIAdvisorView: React.FC<AIAdvisorViewProps> = ({ advices, onAnalyze, isAnalyzing }) => {
  return (
    <div className="p-6 space-y-6 animate-in zoom-in-95 duration-300">
      <div className="text-center space-y-2 py-4">
        <div className="inline-block p-4 bg-blue-500/10 rounded-full mb-2">
          <svg className={`w-8 h-8 text-blue-500 ${isAnalyzing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold">Smart Advisor</h2>
        <p className="text-zinc-500 text-sm max-w-xs mx-auto">Get real-time market sentiment and trade suggestions powered by Gemini AI.</p>
      </div>

      <button
        onClick={onAnalyze}
        disabled={isAnalyzing}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 py-4 rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
      >
        {isAnalyzing ? 'Scanning Market...' : 'Run Analysis'}
      </button>

      <div className="space-y-4">
        {advices.length > 0 ? (
          advices.map((advice, i) => (
            <div key={i} className="bg-zinc-900 border border-white/10 p-5 rounded-3xl relative overflow-hidden group">
               <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-xl text-[10px] font-bold uppercase tracking-widest ${
                 advice.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 
                 advice.action === 'SELL' ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-700 text-zinc-300'
               }`}>
                 {advice.action}
               </div>
               
               <div className="flex items-center gap-2 mb-3">
                 <h4 className="text-xl font-black">{advice.symbol}</h4>
                 <span className="text-xs text-zinc-500">• {advice.sentiment} sentiment</span>
               </div>
               
               <p className="text-sm text-zinc-300 leading-relaxed mb-4 italic">"{advice.reason}"</p>
               
               <div className="flex items-center justify-between pt-4 border-t border-white/5">
                 <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <div key={star} className={`w-3 h-3 rounded-full ${star <= advice.confidence / 20 ? 'bg-blue-500' : 'bg-zinc-800'}`}></div>
                    ))}
                 </div>
                 <span className="text-[10px] text-zinc-600 font-bold uppercase">Confidence Score: {advice.confidence}%</span>
               </div>
            </div>
          ))
        ) : !isAnalyzing && (
          <div className="text-center py-10">
            <p className="text-zinc-600 text-sm italic">Click "Run Analysis" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAdvisorView;
