
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Stock, Portfolio, Holding, Transaction, View, AIAdvice } from './types';
import { getMarketAnalysis } from './services/geminiService';
import MarketView from './components/MarketView';
import PortfolioView from './components/PortfolioView';
import AIAdvisorView from './components/AIAdvisorView';
import HomeView from './components/HomeView';
import Navigation from './components/Navigation';
import TradeModal from './components/TradeModal';

const STORAGE_KEYS = {
  BALANCE: 'tradesim_balance',
  HOLDINGS: 'tradesim_holdings',
  STOCKS: 'tradesim_stocks',
};

const INITIAL_BALANCE = 100000;
const INITIAL_STOCKS: Stock[] = [
  // US Tech
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, changePercent: 0.68, history: [], marketCap: '2.8T', volume: '52M' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 175.22, change: -4.50, changePercent: -2.50, history: [], marketCap: '550B', volume: '110M' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.30, change: 12.45, changePercent: 1.44, history: [], marketCap: '2.1T', volume: '45M' },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.50, change: 2.10, changePercent: 0.51, history: [], marketCap: '3.1T', volume: '18M' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 152.40, change: 0.85, changePercent: 0.56, history: [], marketCap: '1.9T', volume: '22M' },
  { symbol: 'AMZN', name: 'Amazon.com', price: 178.15, change: -1.20, changePercent: -0.67, history: [], marketCap: '1.8T', volume: '33M' },
  // Canadian Market (TSX)
  { symbol: 'RY.TO', name: 'Royal Bank of Canada', price: 142.50, change: 0.45, changePercent: 0.32, history: [], marketCap: '200B', volume: '4.2M' },
  { symbol: 'TD.TO', name: 'Toronto-Dominion Bank', price: 81.20, change: -0.15, changePercent: -0.18, history: [], marketCap: '145B', volume: '6.5M' },
  { symbol: 'SHOP.TO', name: 'Shopify Inc.', price: 105.40, change: 3.20, changePercent: 3.13, history: [], marketCap: '135B', volume: '3.8M' },
  { symbol: 'ENB.TO', name: 'Enbridge Inc.', price: 48.30, change: -0.12, changePercent: -0.25, history: [], marketCap: '102B', volume: '8.1M' },
  { symbol: 'CNR.TO', name: 'Canadian National Railway', price: 172.10, change: 1.10, changePercent: 0.64, history: [], marketCap: '110B', volume: '1.2M' },
];

const App: React.FC = () => {
  // Initialize state from localStorage or defaults
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BALANCE);
    return saved !== null ? parseFloat(saved) : INITIAL_BALANCE;
  });

  const [holdings, setHoldings] = useState<Holding[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HOLDINGS);
    return saved !== null ? JSON.parse(saved) : [];
  });

  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.STOCKS);
    return saved !== null ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const [currentView, setCurrentView] = useState<View>('HOME');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAdvices, setAiAdvices] = useState<AIAdvice[]>([]);

  // Persistence side effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BALANCE, balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HOLDINGS, JSON.stringify(holdings));
  }, [holdings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.STOCKS, JSON.stringify(stocks));
  }, [stocks]);

  // Simulation of real-time price changes
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(currentStocks => 
        currentStocks.map(stock => {
          // Volatility adjustment for different markets
          const isCanadian = stock.symbol.endsWith('.TO');
          const volatility = isCanadian ? 0.0015 : 0.0025;
          const fluctuation = 1 + (Math.random() * volatility * 2 - volatility);
          const newPrice = stock.price * fluctuation;
          const change = newPrice - stock.price;
          const changePercent = (change / stock.price) * 100;
          
          const newHistory = [...stock.history, { time: new Date().toLocaleTimeString(), price: newPrice }].slice(-20);

          return {
            ...stock,
            price: newPrice,
            change,
            changePercent,
            history: newHistory
          };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const totalEquity = useMemo(() => {
    return holdings.reduce((acc, h) => {
      const stock = stocks.find(s => s.symbol === h.symbol);
      return acc + (h.shares * (stock?.price || 0));
    }, 0);
  }, [holdings, stocks]);

  const portfolioValue = balance + totalEquity;

  const handleTrade = (type: 'BUY' | 'SELL', symbol: string, shares: number) => {
    const stock = stocks.find(s => s.symbol === symbol);
    if (!stock) return;

    const cost = shares * stock.price;

    if (type === 'BUY') {
      if (cost > balance) {
        alert("Insufficient balance!");
        return;
      }
      setBalance(prev => prev - cost);
      setHoldings(prev => {
        const existing = prev.find(h => h.symbol === symbol);
        if (existing) {
          return prev.map(h => h.symbol === symbol 
            ? { ...h, shares: h.shares + shares, averagePrice: (h.averagePrice * h.shares + cost) / (h.shares + shares) }
            : h
          );
        }
        return [...prev, { symbol, shares, averagePrice: stock.price }];
      });
    } else {
      const existing = holdings.find(h => h.symbol === symbol);
      if (!existing || existing.shares < shares) {
        alert("Not enough shares!");
        return;
      }
      setBalance(prev => prev + cost);
      setHoldings(prev => {
        const updated = prev.map(h => h.symbol === symbol ? { ...h, shares: h.shares - shares } : h);
        return updated.filter(h => h.shares > 0);
      });
    }
    setShowTradeModal(false);
  };

  const handleAddStock = (newStock: Stock) => {
    setStocks(prev => {
      if (prev.find(s => s.symbol === newStock.symbol)) return prev;
      return [...prev, newStock];
    });
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    const advice = await getMarketAnalysis(stocks, holdings, balance);
    setAiAdvices(advice);
    setIsAnalyzing(false);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-black text-white relative overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-6 bg-zinc-900/50 backdrop-blur-lg border-b border-white/10 shrink-0">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-zinc-400 text-sm font-medium">Portfolio Value</p>
            <h1 className="text-3xl font-bold tracking-tight">
              ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
          </div>
          <div className="text-right">
             <span className={`text-sm font-semibold px-2 py-1 rounded-full ${portfolioValue >= INITIAL_BALANCE ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {portfolioValue >= INITIAL_BALANCE ? '+' : ''}{((portfolioValue - INITIAL_BALANCE) / INITIAL_BALANCE * 100).toFixed(2)}%
             </span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {currentView === 'HOME' && <HomeView stocks={stocks} holdings={holdings} onSelectStock={(s) => { setSelectedStock(s); setShowTradeModal(true); }} />}
        {currentView === 'MARKET' && <MarketView stocks={stocks} onSelectStock={(s) => { setSelectedStock(s); setShowTradeModal(true); }} onAddStock={handleAddStock} />}
        {currentView === 'PORTFOLIO' && <PortfolioView stocks={stocks} holdings={holdings} balance={balance} onSelectStock={(s) => { setSelectedStock(s); setShowTradeModal(true); }} />}
        {currentView === 'AI' && (
          <AIAdvisorView 
            advices={aiAdvices} 
            stocks={stocks}
            onAnalyze={runAnalysis} 
            onSelectStock={(s) => { setSelectedStock(s); setShowTradeModal(true); }}
            isAnalyzing={isAnalyzing} 
          />
        )}
      </div>

      {/* Trade Modal */}
      {showTradeModal && selectedStock && (
        <TradeModal 
          stock={selectedStock} 
          balance={balance} 
          holding={holdings.find(h => h.symbol === selectedStock.symbol)}
          onClose={() => setShowTradeModal(false)}
          onTrade={handleTrade}
        />
      )}

      {/* Navigation */}
      <Navigation currentView={currentView} setView={setCurrentView} />
    </div>
  );
};

export default App;
