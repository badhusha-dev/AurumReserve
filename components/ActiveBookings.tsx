
import React, { useState, useEffect } from 'react';
import { Booking, CurrencyCode } from '../types';
import { Clock, MapPin, QrCode, ArrowLeft, Info, ChevronRight, AlertTriangle } from 'lucide-react';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants';

interface Props {
  bookings: Booking[];
  currency: CurrencyCode;
  onVisitStore: () => void;
}

const ActiveBookings: React.FC<Props> = ({ bookings, currency, onVisitStore }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatPrice = (val: number) => {
    const converted = val * EXCHANGE_RATES[currency];
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - now.getTime();
    if (diff <= 0) return "EXPIRED";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const activeBookings = bookings.filter(b => b.status === 'ACTIVE');

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black flex items-center gap-3">
          <Clock className="w-6 h-6 text-yellow-500" />
          Vault Reservations
        </h2>
      </div>

      {activeBookings.length === 0 ? (
        <div className="bg-[#1a1a1a] rounded-3xl p-12 text-center border border-white/5">
           <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
           <p className="text-slate-400 font-bold">No active holds found.</p>
           <p className="text-xs text-slate-500 mt-2">Browse the Atelier to reserve exclusive designs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {activeBookings.map(b => (
            <div key={b.id} className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden p-6 md:p-8 relative">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="shrink-0">
                  <div className="w-32 h-32 bg-white rounded-3xl p-3 flex items-center justify-center relative shadow-2xl">
                    <QrCode className="w-full h-full text-black" />
                    <div className="absolute -bottom-2 bg-yellow-500 text-black text-[9px] font-black px-3 py-1 rounded-full border-4 border-[#1a1a1a]">
                      SCAN AT STORE
                    </div>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">{b.itemSku}</span>
                    <span className="w-1 h-1 bg-slate-700 rounded-full" />
                    <span className="text-[10px] font-black text-yellow-500 uppercase">Rate Locked</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">{b.itemName}</h3>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-4">
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Expires In</p>
                      <p className="text-sm font-black text-rose-500">{getRemainingTime(b.expiresAt)}</p>
                    </div>
                    <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                      <p className="text-[9px] font-bold text-slate-500 uppercase">Locked Rate</p>
                      <p className="text-sm font-black text-white">{formatPrice(b.lockedPrice)}/g</p>
                    </div>
                    <div className="bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/10">
                      <p className="text-[9px] font-bold text-emerald-500 uppercase">Collateral</p>
                      <p className="text-sm font-black text-white">
                        {b.collateralType === 'CASH_ADVANCE' ? `$${b.collateralValue}` : `${b.collateralValue}g Lock`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button className="bg-white text-black px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-yellow-500 transition-colors">
                    <MapPin className="w-4 h-4" /> Near Store
                  </button>
                  <button className="bg-white/5 text-slate-400 px-6 py-4 rounded-2xl font-bold text-sm hover:text-white transition-colors">
                    Directions
                  </button>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                   <Info className="w-4 h-4 text-indigo-400" />
                   <span>Item is held at the <span className="text-white font-bold">Madison Ave Branch</span>. Please present the QR code.</span>
                </div>
                <div className="w-full md:w-auto flex items-center gap-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Secure Vault ID: {b.id}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-indigo-600/10 border border-indigo-600/20 p-6 rounded-3xl">
        <h4 className="font-bold text-white mb-2">The 4-Day Price Lock Guarantee</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your reservation protects you from market volatility. If the gold price increases during these 4 days, you still pay the locked rate. If the price drops, you get the lower live rate at the store!
        </p>
      </div>
    </div>
  );
};

export default ActiveBookings;
