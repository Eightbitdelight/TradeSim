
export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  history: { time: string; price: number }[];
  marketCap: string;
  volume: string;
}

export interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
}

export interface Portfolio {
  balance: number;
  holdings: Holding[];
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  shares: number;
  price: number;
  timestamp: number;
}

export type View = 'HOME' | 'MARKET' | 'PORTFOLIO' | 'AI';

export interface AIAdvice {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  reason: string;
  confidence: number;
  sentiment: string;
}
