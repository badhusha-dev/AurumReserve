
import React from 'react';
import { GoldRate, CurrencyCode, User } from '../types';
import { ShieldCheck, Globe, User as UserIcon, LogOut } from 'lucide-react';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants';

interface Props {
  currentRate: GoldRate;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currentUser: User;
  onLogout: () => void;
}

const Header: React.FC<Props> = ({ currentRate, currency, setCurrency, currentUser, onLogout }) => {
  const formatRate = (rate: number) => {
    const converted = rate * EXCHANGE_RATES[currency];
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <header className="bg-[#161616] border-b border-white/5 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-500/10 rounded-lg flex items-center justify-center text-yellow-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">Aurum<span className="text-yellow-500">Reserve</span></h1>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex bg-[#222] p-1 rounded-xl">
              {(['INR', 'USD', 'AED'] as CurrencyCode[]).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${currency === c ? 'bg-yellow-500 text-black shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-white/10" />

            <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-500 leading-none mb-1">{currentUser.role}</p>
                <p className="text-xs font-bold text-white leading-none">{currentUser.name}</p>
              </div>
              <button 
                onClick={onLogout}
                className="ml-2 p-1.5 text-slate-500 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <span className="text-[10px] font-bold text-slate-500 uppercase block leading-none mb-1">Live 24K</span>
              <span className="text-sm font-bold text-yellow-500">{formatRate(currentRate.price24k)}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
