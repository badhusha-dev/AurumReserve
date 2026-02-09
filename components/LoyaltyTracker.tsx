
import React from 'react';
import { Award, Zap, TrendingUp, ShieldCheck } from 'lucide-react';

interface Props {
  tier: 'SILVER' | 'GOLD' | 'PLATINUM';
  streak: number;
}

const LoyaltyTracker: React.FC<Props> = ({ tier, streak }) => {
  const tiers = {
    SILVER: { color: 'text-slate-400', bg: 'bg-slate-100', progress: 30, perk: 'Standard Rates' },
    GOLD: { color: 'text-yellow-500', bg: 'bg-yellow-50', progress: 65, perk: '0.5% Cash-back' },
    PLATINUM: { color: 'text-indigo-600', bg: 'bg-indigo-50', progress: 100, perk: 'Zero Admin Fees' },
  };

  const current = tiers[tier];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
             <Award className={`w-5 h-5 ${current.color}`} />
             {tier} Member
          </h4>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Exclusive Perks</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-[10px] font-extrabold border ${current.color} border-current`}>
          {current.perk}
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-600">Next Tier Progress</span>
            <span className="text-xs font-bold text-indigo-600">{current.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
             <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${current.progress}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
           <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shrink-0">
              <Zap className="w-5 h-5 fill-current" />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-900">Savings Streak: {streak} Transactions</p>
              <p className="text-[10px] text-slate-500 font-medium">Keep it up! 2 more to unlock a 0.5% discount.</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyTracker;
