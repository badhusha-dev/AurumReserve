
import React, { useState, useEffect } from 'react';
import { GoldRate, CalculationConstants } from '../types';
import { Calculator, Info, ShieldCheck, ArrowRight } from 'lucide-react';

interface Props {
  currentRate: GoldRate;
  onInvest: (amount: number) => void;
}

const InvestmentForm: React.FC<Props> = ({ currentRate, onInvest }) => {
  const [amount, setAmount] = useState<string>('5000');
  const [grams, setGrams] = useState<number>(0);
  const [breakdown, setBreakdown] = useState({
    net: 0,
    gst: 0,
    fee: 0
  });

  useEffect(() => {
    const val = parseFloat(amount) || 0;
    if (val > 0) {
      const gst = val * CalculationConstants.GST_PERCENTAGE;
      const fee = val * CalculationConstants.PROCESSING_FEE_PERCENTAGE;
      const net = val - gst - fee;
      setBreakdown({ net, gst, fee });
      setGrams(net / currentRate.price24k);
    } else {
      setBreakdown({ net: 0, gst: 0, fee: 0 });
      setGrams(0);
    }
  }, [amount, currentRate]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-700">Enter Investment Amount (₹)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              placeholder="Min. ₹50"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[1000, 5000, 10000].map(v => (
              <button 
                key={v}
                onClick={() => setAmount(v.toString())}
                className="py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:border-indigo-500 hover:text-indigo-600 transition-all"
              >
                +₹{v.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-slate-400" />
            Conversion Estimate
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Gross Amount</span>
              <span className="font-bold text-slate-900">₹{parseFloat(amount || '0').toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 flex items-center gap-1">GST (3%) <Info className="w-3 h-3 cursor-help" /></span>
              <span className="font-medium text-rose-500">- ₹{breakdown.gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Processing Fee (1%)</span>
              <span className="font-medium text-rose-500">- ₹{breakdown.fee.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-900">Final Weight</span>
              <span className="text-xl font-extrabold text-indigo-600">{grams.toFixed(4)} <span className="text-xs">gms</span></span>
            </div>
          </div>
        </div>

      </div>

      <div className="bg-emerald-50 rounded-2xl p-4 flex items-start gap-4 border border-emerald-100">
        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h5 className="text-sm font-bold text-emerald-900">Instant Accumulation</h5>
          <p className="text-xs text-emerald-700 leading-relaxed mt-1">
            Gold will be added to your locker at the live market rate of ₹{currentRate.price24k.toLocaleString()}/g. All investments are 100% physically backed.
          </p>
        </div>
      </div>

      <button 
        onClick={() => onInvest(parseFloat(amount))}
        disabled={!amount || parseFloat(amount) <= 0}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 group"
      >
        Confirm Investment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  );
};

export default InvestmentForm;
