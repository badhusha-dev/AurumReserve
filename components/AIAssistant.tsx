
import React, { useState, useEffect } from 'react';
import { getGoldInsights } from '../services/geminiService';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { UserStats } from '../types';

interface Props {
  userStats: UserStats;
  currentRate: number;
}

const AIAssistant: React.FC<Props> = ({ userStats, currentRate }) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInsight = async () => {
    setLoading(true);
    const result = await getGoldInsights(userStats, currentRate);
    setInsight(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsight();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Aurum Advisor AI
        </h3>
        <button 
          onClick={fetchInsight}
          disabled={loading}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          title="Refresh Insights"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
        </button>
      </div>

      <div className="bg-white/10 rounded-xl p-4 border border-white/10 min-h-[100px] flex flex-col justify-center">
        {loading ? (
          <div className="space-y-2">
            <div className="h-3 bg-white/20 rounded-full w-full animate-pulse"></div>
            <div className="h-3 bg-white/20 rounded-full w-3/4 animate-pulse"></div>
            <div className="h-3 bg-white/20 rounded-full w-5/6 animate-pulse"></div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-indigo-50 italic">
            "{insight}"
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center text-indigo-900">
           <span className="text-[10px] font-bold">Pro</span>
        </div>
        <p className="text-[10px] text-indigo-200 uppercase font-bold tracking-wider">Strategy updated in real-time</p>
      </div>
    </div>
  );
};

export default AIAssistant;
