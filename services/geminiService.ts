
import { GoogleGenAI } from "@google/genai";
import { CurrencyCode } from "../types";
import { EXCHANGE_RATES, CURRENCY_SYMBOLS } from "../constants";

// Initializing the Google GenAI SDK with the API key from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGoldInsights = async (userStats: any, currentRate: number, currency: CurrencyCode = 'INR') => {
  const convertedRate = currentRate * EXCHANGE_RATES[currency];
  const symbol = CURRENCY_SYMBOLS[currency];
  
  const prompt = `
    As a senior Global FinTech wealth advisor, provide a sharp 3-sentence analysis of this gold portfolio:
    User Stats: Total Gold: ${userStats.totalGrams}g, Net Gain: ${userStats.gainPercentage}%
    Current Market: ${symbol}${convertedRate.toLocaleString()}/gram (Local Currency: ${currency})
    Loyalty Tier: ${userStats.loyaltyTier}
    
    Mention why gold is a strong hedge in ${currency} today. Advise on gifting as a diversification strategy. Keep it premium and intelligent.
  `;

  try {
    // Using gemini-3-flash-preview for basic text tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    // The text output is obtained directly via the text property
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The global market advisor is currently offline. Reviewing historical data...";
  }
};
