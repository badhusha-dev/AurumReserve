
import React, { useState } from 'react';
import { JewelryItem, GoldRate, CurrencyCode } from '../types';
import { ShoppingCart, Star, Sparkles, Scale, Info, CheckCircle2 } from 'lucide-react';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants';

interface Props {
  inventory: JewelryItem[];
  currentRate: GoldRate;
  userGrams: number;
  currency: CurrencyCode;
  onPurchase: (item: JewelryItem, goldUsed: number, cashPaid: number) => void;
}

const JewelryStore: React.FC<Props> = ({ inventory, currentRate, userGrams, currency, onPurchase }) => {
  const [selectedItem, setSelectedItem] = useState<JewelryItem | null>(null);

  const calculatePrice = (item: JewelryItem) => {
    const purityMultiplier = item.purity === 24 ? 1 : item.purity === 22 ? 0.916 : 0.75;
    const baseMetalValue = currentRate.price24k * purityMultiplier * item.weight;
    const totalBeforeTax = baseMetalValue + item.makingCharges;
    const final = totalBeforeTax * 1.03; // 3% GST
    return final;
  };

  const formatPrice = (val: number) => {
    const converted = val * EXCHANGE_RATES[currency];
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            The Atelier
          </h2>
          <p className="text-slate-400 mt-1">Bespoke jewelry crafted with 100% hallmarked gold.</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-2xl">
          <p className="text-[10px] text-yellow-500 font-bold uppercase mb-1">Your Savings</p>
          <p className="text-xl font-bold text-white">{userGrams} <span className="text-xs font-medium">gms</span></p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventory.map(item => {
          const price = calculatePrice(item);
          const goldValueCredit = userGrams * currentRate.price24k;
          const remainingCash = Math.max(0, price - goldValueCredit);

          return (
            <div key={item.id} className="group bg-[#1a1a1a] rounded-3xl overflow-hidden border border-white/5 hover:border-yellow-500/30 transition-all">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] font-bold text-yellow-500">
                  {item.purity}K GOLD
                </div>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-white leading-tight">{item.name}</h4>
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                    <Scale className="w-3 h-3" /> {item.weight}g
                  </span>
                </div>
                <p className="text-2xl font-black text-white mb-4">{formatPrice(price)}</p>
                
                <div className="bg-white/5 rounded-2xl p-4 mb-6">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-2">Buy with Savings</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-emerald-400">-{formatPrice(Math.min(price, goldValueCredit))}</p>
                      <p className="text-[9px] text-slate-500">Gold Applied</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{formatPrice(remainingCash)}</p>
                      <p className="text-[9px] text-slate-500">Cash Due</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedItem(item)}
                  className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> Buy Now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative">
            <button onClick={() => setSelectedItem(null)} className="absolute top-6 right-6 text-slate-500 hover:text-white">✕</button>
            <h3 className="text-2xl font-black mb-2">Confirm Order</h3>
            <p className="text-slate-400 mb-8">Review your gold utilization and final payment.</p>

            <div className="space-y-4 mb-8">
               <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-slate-400 font-medium">Product Value</span>
                  <span className="font-bold">{formatPrice(calculatePrice(selectedItem))}</span>
               </div>
               <div className="flex justify-between p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                  <span className="font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Savings Credit</span>
                  <span className="font-bold">-{formatPrice(Math.min(calculatePrice(selectedItem), userGrams * currentRate.price24k))}</span>
               </div>
               <div className="flex justify-between p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/20 text-yellow-500 text-lg">
                  <span className="font-black">Pay Remaining</span>
                  <span className="font-black">{formatPrice(Math.max(0, calculatePrice(selectedItem) - (userGrams * currentRate.price24k)))}</span>
               </div>
            </div>

            <button 
              onClick={() => {
                const total = calculatePrice(selectedItem);
                const gValue = userGrams * currentRate.price24k;
                const gUsed = Math.min(userGrams, total / currentRate.price24k);
                onPurchase(selectedItem, gUsed, Math.max(0, total - gValue));
                setSelectedItem(null);
              }}
              className="w-full bg-yellow-500 text-black font-black py-5 rounded-3xl text-lg shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              Confirm and Checkout
            </button>
            <p className="text-[10px] text-center text-slate-500 mt-6 flex items-center justify-center gap-2">
               <Info className="w-3 h-3" /> Secure Payment via 256-bit Encryption
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelryStore;
