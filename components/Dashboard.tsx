
import React from 'react';
import { UserStats, SchemeInfo } from '../types';
import { Wallet, TrendingUp, TrendingDown, Target, Gift, ArrowUpRight } from 'lucide-react';

interface Props {
  stats: UserStats;
  scheme: SchemeInfo;
}

const Dashboard: React.FC<Props> = ({ stats, scheme }) => {
  return (
    <div className="space-y-6">
      
      {/* Wealth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-20 h-20 text-indigo-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Total Gold Balance</p>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{stats.totalGrams} <span className="text-lg text-slate-400 font-medium">gms</span></h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Market Value:</span>
              <span className="text-sm font-bold text-slate-900">₹{stats.currentValue.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-20 h-20 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Unrealized Profit</p>
            <h2 className={`text-3xl font-extrabold mb-2 ${stats.unrealizedGain >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{stats.unrealizedGain.toLocaleString()}
            </h2>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${stats.unrealizedGain >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {stats.unrealizedGain >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(stats.gainPercentage)}% Total Returns
            </div>
          </div>
        </div>
      </div>

      {/* Scheme Tracker */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-indigo-600" />
              {scheme.name} Scheme
            </h3>
            <p className="text-xs text-slate-400 font-medium uppercase mt-1">Pay for 11 months, 12th month installment is on us!</p>
          </div>
          <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100 text-sm font-bold flex items-center gap-2">
            Next Payment: {scheme.nextDueDate} <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between text-sm font-bold mb-1">
            <span className="text-slate-600">Progress: {scheme.monthsPaid}/{scheme.durationMonths} Months</span>
            <span className="text-indigo-600">{Math.round((scheme.monthsPaid / scheme.durationMonths) * 100)}%</span>
          </div>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-indigo-600 rounded-full transition-all duration-1000 relative" 
              style={{ width: `${(scheme.monthsPaid / scheme.durationMonths) * 100}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Target Weight</p>
              <p className="text-sm font-bold text-slate-900">~8.24 gms</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Monthly</p>
              <p className="text-sm font-bold text-slate-900">₹{scheme.monthlyInstallment.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Status</p>
              <p className="text-sm font-bold text-emerald-600">Active</p>
            </div>
            <div className="p-3 bg-indigo-900 rounded-xl">
              <p className="text-[10px] text-indigo-300 font-bold uppercase mb-1">Bonus</p>
              <p className="text-sm font-bold text-white">₹{scheme.monthlyInstallment.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
