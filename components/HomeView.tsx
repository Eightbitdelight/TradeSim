
import React from 'react';
import { Stock, Holding } from '../types';

interface HomeViewProps {
  stocks: Stock[];
  holdings: Holding[];
  onSelectStock: (stock: Stock) => void;
}

const HomeView: React.FC<HomeViewProps> = ({ stocks, holdings, onSelectStock }) => {
  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
  
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
          Top Gainers
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {topGainers.map(stock => (
            <button
              key={stock.symbol}
              onClick={() => onSelectStock(stock)}
              className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex justify-between items-center active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-bold text-blue-400">
                  {stock.symbol[0]}
                </div>
                <div className="text-left">
                  <p className="font-bold">{stock.symbol}</p>
                  <p className="text-xs text-zinc-500">{stock.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${stock.price.toFixed(2)}</p>
                <p className="text-xs font-semibold text-emerald-400">+{stock.changePercent.toFixed(2)}%</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
           <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
           Your Assets
        </h2>
        {holdings.length === 0 ? (
          <div className="bg-zinc-900/40 border border-dashed border-white/10 p-10 rounded-2xl text-center">
            <p className="text-zinc-500 text-sm">No assets held yet.<br/>Explore the market to start trading.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {holdings.slice(0, 4).map(h => {
              const stock = stocks.find(s => s.symbol === h.symbol);
              if (!stock) return null;
              return (
                <div key={h.symbol} className="bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex justify-between">
                  <div>
                    <p className="font-bold">{h.symbol}</p>
                    <p className="text-xs text-zinc-500">{h.shares} Shares</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${(h.shares * stock.price).toLocaleString()}</p>
                    <p className={`text-xs ${stock.price >= h.averagePrice ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {stock.price >= h.averagePrice ? '+' : ''}${(h.shares * (stock.price - h.averagePrice)).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl shadow-blue-500/10">
        <h3 className="font-bold text-lg mb-1">New to Investing?</h3>
        <p className="text-blue-100 text-sm mb-4">Unlock AI-powered insights to help you build a smarter portfolio.</p>
        <button className="bg-white text-blue-600 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
          Learn More
        </button>
      </div>
    </div>
  );
};

export default HomeView;
