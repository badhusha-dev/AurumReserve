import React, { useState } from 'react';
import { JewelryItem, GoldRate, CurrencyCode, CalculationConstants } from '../types';
import { ShoppingCart, Star, Sparkles, Scale, Info, CheckCircle2, Bookmark, ShieldCheck, Wallet, DollarSign, Calculator } from 'lucide-react';
import { CURRENCY_SYMBOLS, EXCHANGE_RATES } from '../constants';

interface Props {
  inventory: JewelryItem[];
  currentRate: GoldRate;
  userGrams: number;
  currency: CurrencyCode;
  onPurchase: (item: JewelryItem, goldUsed: number, cashPaid: number) => void;
  onReserve: (item: JewelryItem, type: 'CASH_ADVANCE' | 'GOLD_LOCK', collateralValue: number) => void;
}

const JewelryStore: React.FC<Props> = ({ inventory, currentRate, userGrams, currency, onPurchase, onReserve }) => {
  const [selectedItem, setSelectedItem] = useState<JewelryItem | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveCollateral, setReserveCollateral] = useState<'CASH_ADVANCE' | 'GOLD_LOCK'>('CASH_ADVANCE');

  const calculatePrice = (item: JewelryItem) => {
    const purityMultiplier = item.purity === 24 ? 1 : item.purity === 22 ? 0.916 : 0.75;
    const baseMetalValue = currentRate.price24k * purityMultiplier * item.weight;
    
    // Support both Fixed and Percentage charge types
    const makingFee = item.makingChargeType === 'FIXED' 
      ? item.makingCharges 
      : (baseMetalValue * item.makingCharges) / 100;
      
    const totalBeforeTax = baseMetalValue + makingFee;
    const final = totalBeforeTax * 1.03; // 3% GST
    return final;
  };

  const formatPrice = (val: number) => {
    const converted = val * EXCHANGE_RATES[currency];
    return `${CURRENCY_SYMBOLS[currency]}${converted.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  };

  const handleReserveClick = (item: JewelryItem) => {
    setSelectedItem(item);
    setShowReserveModal(true);
  };

  const handleConfirmReservation = () => {
    if (!selectedItem) return;
    const collateralValue = reserveCollateral === 'CASH_ADVANCE' 
      ? CalculationConstants.BOOKING_CASH_ADVANCE 
      : 1.5; // Lock 1.5g as collateral
    onReserve(selectedItem, reserveCollateral, collateralValue);
    setShowReserveModal(false);
    setSelectedItem(null);
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
                
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="bg-white text-black font-black py-4 rounded-2xl hover:bg-yellow-500 transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" /> Buy
                  </button>
                  <button 
                    onClick={() => handleReserveClick(item)}
                    className="bg-[#222] text-white border border-white/10 font-black py-4 rounded-2xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                  >
                    <Bookmark className="w-4 h-4 text-yellow-500" /> Reserve
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Buy Modal */}
      {selectedItem && !showReserveModal && (
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
          </div>
        </div>
      )}

      {/* Reserve Modal */}
      {selectedItem && showReserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative">
            <button onClick={() => {setSelectedItem(null); setShowReserveModal(false);}} className="absolute top-6 right-6 text-slate-500 hover:text-white">✕</button>
            <h3 className="text-2xl font-black mb-2">Reserve Design</h3>
            <p className="text-slate-400 mb-8">Lock price for 4 days. Visit store to complete purchase.</p>

            <div className="space-y-4 mb-8">
              <label className="text-xs font-bold text-slate-500 uppercase">Choose Collateral</label>
              
              <div 
                onClick={() => setReserveCollateral('CASH_ADVANCE')}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${reserveCollateral === 'CASH_ADVANCE' ? 'border-yellow-500 bg-yellow-500/5' : 'border-white/5 bg-white/5'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-5 h-5 ${reserveCollateral === 'CASH_ADVANCE' ? 'text-yellow-500' : 'text-slate-500'}`} />
                    <span className="font-bold text-white">Cash Advance</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${reserveCollateral === 'CASH_ADVANCE' ? 'border-yellow-500 bg-yellow-500' : 'border-slate-700'}`} />
                </div>
                <p className="text-xs text-slate-400">Pay ${CalculationConstants.BOOKING_CASH_ADVANCE} advance now. Refundable on purchase.</p>
              </div>

              <div 
                onClick={() => setReserveCollateral('GOLD_LOCK')}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer ${reserveCollateral === 'GOLD_LOCK' ? 'border-yellow-500 bg-yellow-500/5' : 'border-white/5 bg-white/5'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Wallet className={`w-5 h-5 ${reserveCollateral === 'GOLD_LOCK' ? 'text-yellow-500' : 'text-slate-500'}`} />
                    <span className="font-bold text-white">Lock Gold Balance</span>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 ${reserveCollateral === 'GOLD_LOCK' ? 'border-yellow-500 bg-yellow-500' : 'border-slate-700'}`} />
                </div>
                <p className="text-xs text-slate-400">Lock 1.5g from your current savings as security collateral.</p>
              </div>
            </div>

            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-start gap-3 mb-8">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                By reserving, you lock the 24K Gold Rate at <span className="text-white font-bold">{formatPrice(currentRate.price24k)}/g</span>. This rate is guaranteed for 96 hours.
              </p>
            </div>

            <button 
              onClick={handleConfirmReservation}
              disabled={reserveCollateral === 'GOLD_LOCK' && userGrams < 1.5}
              className="w-full bg-yellow-500 disabled:bg-slate-700 text-black font-black py-5 rounded-3xl text-lg shadow-xl shadow-yellow-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              {reserveCollateral === 'GOLD_LOCK' && userGrams < 1.5 ? 'Insufficient Gold' : 'Reserve for 96 Hours'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default JewelryStore;