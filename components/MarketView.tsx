
import React, { useState } from 'react';
import { Stock } from '../types';
import { searchGlobalStock } from '../services/geminiService';

interface MarketViewProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  onAddStock: (stock: Stock) => void;
}

const MarketView: React.FC<MarketViewProps> = ({ stocks, onSelectStock, onAddStock }) => {
  const [search, setSearch] = useState('');
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalResult, setGlobalResult] = useState<Stock | null>(null);
  
  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(search.toLowerCase()) || 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleGlobalSearch = async () => {
    if (!search.trim()) return;
    setIsSearchingGlobal(true);
    setGlobalResult(null);
    const result = await searchGlobalStock(search);
    setGlobalResult(result);
    setIsSearchingGlobal(false);
  };

  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-right duration-300">
      {/* Search Bar */}
      <div className="space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search symbols or company..." 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setGlobalResult(null);
            }}
            className="w-full bg-zinc-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Global Search Prompt */}
        {search.length > 1 && filteredStocks.length === 0 && !globalResult && (
          <button 
            onClick={handleGlobalSearch}
            disabled={isSearchingGlobal}
            className="w-full py-4 bg-blue-600/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-600/20 transition-all group"
          >
            {isSearchingGlobal ? (
              <span className="animate-pulse">Searching global markets...</span>
            ) : (
              <>
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9-3-9m-9 9a9 9 0 019-9" />
                </svg>
                Search for "{search}" Globally
              </>
            )}
          </button>
        )}
      </div>

      {/* Global Result Card */}
      {globalResult && (
        <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/30 p-6 rounded-3xl animate-in zoom-in-95 duration-500">
           <div className="flex justify-between items-start mb-4">
             <div>
               <h3 className="text-2xl font-black">{globalResult.symbol}</h3>
               <p className="text-zinc-400 text-sm font-medium">{globalResult.name}</p>
             </div>
             <div className="text-right">
               <p className="text-xl font-bold">${globalResult.price.toFixed(2)}</p>
               <p className={`text-xs font-bold ${globalResult.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {globalResult.change >= 0 ? '+' : ''}{globalResult.changePercent.toFixed(2)}%
               </p>
             </div>
           </div>
           <button 
            onClick={() => {
              onAddStock(globalResult);
              setGlobalResult(null);
              setSearch('');
            }}
            className="w-full bg-blue-600 text-white font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[10px] active:scale-95 transition-all shadow-lg shadow-blue-600/30"
           >
             Add to Watchlist
           </button>
        </div>
      )}

      {/* Stock List */}
      <div className="space-y-3">
        <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] px-2 mb-4">
          {search ? 'Filtered Results' : 'Market Overview'}
        </h2>
        {filteredStocks.map(stock => (
          <button
            key={stock.symbol}
            onClick={() => onSelectStock(stock)}
            className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 border border-white/5 p-4 rounded-2xl flex justify-between items-center transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-zinc-300 group-hover:text-blue-400 transition-colors">
                {stock.symbol[0]}
              </div>
              <div className="text-left">
                <p className="font-bold group-hover:translate-x-1 transition-transform">{stock.symbol}</p>
                <p className="text-xs text-zinc-500">{stock.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className={`text-xs font-semibold ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stock.change >= 0 ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
              </p>
            </div>
          </button>
        ))}
        {search && filteredStocks.length === 0 && !globalResult && !isSearchingGlobal && (
          <div className="text-center py-10">
            <p className="text-zinc-600 text-sm italic">No local stocks found for "{search}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketView;
