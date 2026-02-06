
import React from 'react';
import { Stock, Holding } from '../types';

interface PortfolioViewProps {
  stocks: Stock[];
  holdings: Holding[];
  balance: number;
  onSelectStock: (stock: Stock) => void;
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ stocks, holdings, balance, onSelectStock }) => {
  return (
    <div className="p-6 space-y-6 animate-in slide-in-from-left duration-300">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Available Cash</p>
          <p className="text-xl font-bold">${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5">
          <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Total Assets</p>
          <p className="text-xl font-bold">{holdings.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Your Positions</h2>
        {holdings.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
            <p className="text-zinc-500 italic">No holdings yet.</p>
          </div>
        ) : (
          holdings.map(h => {
            const stock = stocks.find(s => s.symbol === h.symbol);
            if (!stock) return null;
            const marketValue = h.shares * stock.price;
            const profit = marketValue - (h.shares * h.averagePrice);
            const profitPercent = (profit / (h.shares * h.averagePrice)) * 100;

            return (
              <button
                key={h.symbol}
                onClick={() => onSelectStock(stock)}
                className="w-full bg-zinc-900/40 border border-white/5 p-4 rounded-2xl flex flex-col gap-2 active:scale-[0.98] transition-all"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold">{h.symbol[0]}</div>
                    <div className="text-left">
                      <p className="font-bold">{h.symbol}</p>
                      <p className="text-xs text-zinc-500">{h.shares} shares @ ${h.averagePrice.toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${marketValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    <p className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {profit >= 0 ? '+' : ''}{profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                    </p>
                  </div>
                </div>
                <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
                   <div 
                    className={`h-full transition-all duration-1000 ${profit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                    style={{ width: `${Math.min(100, Math.max(0, 50 + profitPercent))}%` }}
                   />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PortfolioView;
