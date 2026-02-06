
import { GoogleGenAI, Type } from "@google/genai";
import { Stock, Holding, AIAdvice } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getMarketAnalysis(stocks: Stock[], holdings: Holding[], balance: number): Promise<AIAdvice[]> {
  const holdingsSummary = holdings.map(h => `${h.shares} shares of ${h.symbol} at avg $${h.averagePrice.toFixed(2)}`).join(', ');
  const marketSummary = stocks.map(s => `${s.symbol} ($${s.price.toFixed(2)}, ${s.changePercent.toFixed(2)}%)`).join(', ');

  const prompt = `
    Current Portfolio Balance: $${balance.toFixed(2)}
    User Holdings: ${holdingsSummary || 'None'}
    Market Trends (US Tech and Canadian TSX): ${marketSummary}

    Analyze the current portfolio and market trends for both US Technology and the Canadian stock market. 
    Provide high-quality financial insights. 
    Suggest 3 specific trade actions (BUY/SELL/HOLD). 
    Consider the geographical diversification between US and Canada if applicable.
    Base your logic on the trend direction and basic risk management.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              symbol: { type: Type.STRING },
              action: { type: Type.STRING, description: 'BUY, SELL, or HOLD' },
              reason: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              sentiment: { type: Type.STRING }
            },
            required: ['symbol', 'action', 'reason', 'confidence', 'sentiment']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return [];
  }
}

export async function searchGlobalStock(query: string): Promise<Stock | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Find the current stock market information for: "${query}". 
      Return the most accurate ticker symbol, full company name, current trading price (in USD or local currency if specified), 
      approximate market cap, and trading volume. 
      Format the response exactly as a JSON object with properties: symbol, name, price (number), change (number), changePercent (number), marketCap (string), volume (string).`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symbol: { type: Type.STRING },
            name: { type: Type.STRING },
            price: { type: Type.NUMBER },
            change: { type: Type.NUMBER },
            changePercent: { type: Type.NUMBER },
            marketCap: { type: Type.STRING },
            volume: { type: Type.STRING }
          },
          required: ['symbol', 'name', 'price', 'change', 'changePercent', 'marketCap', 'volume']
        }
      }
    });

    const stockData = JSON.parse(response.text);
    return {
      ...stockData,
      history: []
    };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return null;
  }
}

export async function getStockNews(symbol: string) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Search for the latest news and sentiment for stock ticker: ${symbol}. If it ends in .TO, it is on the Toronto Stock Exchange. Summarize the key catalyst.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Related News',
      url: chunk.web?.uri || '#'
    })) || [];

    return {
      summary: response.text,
      sources
    };
  } catch (error) {
    console.error("Gemini News Error:", error);
    return { summary: "Could not fetch news at this time.", sources: [] };
  }
}
