
import React, { useState, useEffect, useMemo } from 'react';
import { Stock, Holding } from '../types';
import { getStockNews } from '../services/geminiService';
import { AreaChart, Area, ResponsiveContainer, YAxis, Tooltip, XAxis } from 'recharts';

interface TradeModalProps {
  stock: Stock;
  balance: number;
  holding?: Holding;
  onClose: () => void;
  onTrade: (type: 'BUY' | 'SELL', symbol: string, shares: number) => void;
}

type TimeRange = '1D' | '1W' | '1M' | '1Y';

const TradeModal: React.FC<TradeModalProps> = ({ stock, balance, holding, onClose, onTrade }) => {
  const [shares, setShares] = useState(1);
  const [news, setNews] = useState<{ summary: string; sources: any[] } | null>(null);
  const [loadingNews, setLoadingNews] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('1D');

  useEffect(() => {
    async function fetchNews() {
      setLoadingNews(true);
      const res = await getStockNews(stock.symbol);
      setNews(res);
      setLoadingNews(false);
    }
    fetchNews();
  }, [stock.symbol]);

  // Generate mock historical data based on time range
  const chartData = useMemo(() => {
    if (timeRange === '1D' && stock.history.length > 0) {
      return stock.history;
    }

    const points = timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : 52;
    const data = [];
    let currentPrice = stock.price;
    const volatility = timeRange === '1Y' ? 0.05 : 0.02;

    for (let i = points; i >= 0; i--) {
      const change = currentPrice * (Math.random() * volatility * 2 - volatility);
      currentPrice -= change;
      data.unshift({
        time: i === 0 ? 'Now' : `${i}${timeRange === '1W' ? 'd' : timeRange === '1M' ? 'd' : 'w'} ago`,
        price: currentPrice
      });
    }
    // Set the last point to exact current price
    data[data.length - 1].price = stock.price;
    return data;
  }, [stock.price, stock.history, timeRange]);

  const totalCost = shares * stock.price;
  const canBuy = totalCost <= balance;
  const canSell = holding ? holding.shares >= shares : false;

  const ranges: TimeRange[] = ['1D', '1W', '1M', '1Y'];

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-zinc-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] border border-white/10 overflow-hidden max-h-[95vh] flex flex-col slide-in-from-bottom duration-500 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-zinc-900/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tighter">{stock.symbol}</h2>
              <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 rounded text-[10px] font-bold tracking-widest uppercase">
                {stock.symbol.endsWith('.TO') ? 'TSX' : 'NASDAQ'}
              </span>
            </div>
            <p className="text-zinc-500 text-sm font-medium">{stock.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all active:scale-90"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scrollbar">
          {/* Price Highlight */}
          <div className="px-6 py-4 flex justify-between items-baseline">
            <h3 className="text-4xl font-bold tracking-tighter">
              ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <span className={`text-sm font-bold ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </span>
          </div>

          {/* Chart Section */}
          <div className="space-y-4">
            <div className="h-48 w-full px-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={stock.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={stock.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                  />
                  <YAxis domain={['auto', 'auto']} hide />
                  <XAxis dataKey="time" hide />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={stock.change >= 0 ? '#10b981' : '#f43f5e'} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    strokeWidth={3} 
                    isAnimationActive={true} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Range Selector */}
            <div className="flex justify-center gap-2 px-6">
              {ranges.map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    timeRange === range 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {/* Trade Inputs */}
          <div className="p-6 space-y-4">
            <div className="bg-black/40 p-5 rounded-[2rem] border border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Quantity</span>
                <div className="flex items-center gap-4 bg-zinc-800/50 p-1 rounded-full border border-white/5">
                  <button 
                    onClick={() => setShares(Math.max(1, shares - 1))}
                    className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold hover:bg-zinc-700 active:scale-90 transition-all"
                  >-</button>
                  <input 
                    type="number" 
                    value={shares} 
                    onChange={(e) => setShares(parseInt(e.target.value) || 0)}
                    className="bg-transparent text-xl font-black w-12 text-center focus:outline-none"
                  />
                  <button 
                    onClick={() => setShares(shares + 1)}
                    className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-xl font-bold hover:bg-zinc-700 active:scale-90 transition-all"
                  >+</button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Est. Total</span>
                  <span className="font-bold text-lg">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-zinc-600">
                  <span>Buying Power</span>
                  <span>${balance.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Market Insights (Gemini) */}
            <div className="bg-zinc-800/30 border border-white/5 p-5 rounded-[2rem] space-y-3">
              <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                Gemini Market Analysis
              </h4>
              {loadingNews ? (
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-zinc-800 rounded-full animate-pulse"></div>
                  <div className="h-3 w-1/2 bg-zinc-800 rounded-full animate-pulse"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">{news?.summary || 'No recent catalysts found.'}</p>
                  {news?.sources && news.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                      {news.sources.slice(0, 2).map((s, idx) => (
                        <a key={idx} href={s.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[9px] font-bold text-zinc-500 hover:text-blue-400 transition-colors bg-zinc-800/50 px-2 py-1 rounded-lg">
                          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth={2.5}/></svg>
                          {s.title.length > 20 ? s.title.substring(0, 20) + '...' : s.title}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-6 grid grid-cols-2 gap-4 bg-zinc-900 border-t border-white/5 pb-12 sm:pb-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <button
            onClick={() => onTrade('BUY', stock.symbol, shares)}
            disabled={!canBuy}
            className={`py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all active:scale-95 shadow-xl ${
              canBuy ? 'bg-emerald-500 text-emerald-950 shadow-emerald-500/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Buy Position
          </button>
          <button
            onClick={() => onTrade('SELL', stock.symbol, shares)}
            disabled={!canSell}
            className={`py-4 rounded-2xl font-black uppercase tracking-[0.15em] text-xs transition-all active:scale-95 shadow-xl ${
              canSell ? 'bg-rose-500 text-rose-950 shadow-rose-500/20' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
            }`}
          >
            Sell Position
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;
