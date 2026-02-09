
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGoldInsights = async (userStats: any, currentRate: number) => {
  const prompt = `
    As a senior FinTech wealth advisor, provide a 3-sentence analysis of the following gold investment portfolio:
    Total Invested: ₹${userStats.totalInvested}
    Accumulated Gold: ${userStats.totalGrams} grams
    Current Gold Rate: ₹${currentRate}/gram
    Total Portfolio Value: ₹${userStats.currentValue}
    Net Gain/Loss: ₹${userStats.unrealizedGain} (${userStats.gainPercentage}%)
    
    Mention the impact of current market volatility and suggest whether this is a good time to continue the 11-month savings scheme. Keep it professional and encouraging.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });
    return response.text || "Unable to generate insights at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The Aurum Advisor is currently offline. Please try again later.";
  }
};

export const getSchemeComparison = async (investmentAmount: number) => {
  const prompt = `
    Compare a standard Recurring Deposit (6% interest) vs an 11-month Gold Savings Scheme where the 12th installment is free (paid by jeweler). 
    Assume gold price grows at 10% annually. Monthly investment: ₹${investmentAmount}.
    Give a quick bullet-point summary of the benefits.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    return "Error comparing schemes.";
  }
};
