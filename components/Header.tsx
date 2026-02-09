
import React from 'react';
import { GoldRate } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface Props {
  currentRate: GoldRate;
}

const Header: React.FC<Props> = ({ currentRate }) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-900 rounded-xl flex items-center justify-center text-yellow-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Aurum<span className="text-indigo-600">Reserve</span></h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Safe • Pure • Digital</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live 24K Rate</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-lg font-bold text-slate-900">₹{currentRate.price24k.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-xs text-slate-400 ml-1">/g</span></p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live 22K Rate</span>
              </div>
              <p className="text-lg font-bold text-slate-900">₹{currentRate.price22k.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="text-xs text-slate-400 ml-1">/g</span></p>
            </div>
          </div>

          <div className="md:hidden">
             <div className="bg-slate-50 px-3 py-1 rounded-full border border-slate-100 flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500">24K:</span>
                <span className="text-sm font-bold text-slate-900">₹{Math.round(currentRate.price24k)}</span>
             </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
