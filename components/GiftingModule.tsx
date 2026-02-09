
import React, { useState } from 'react';
import { GiftMetadata, CurrencyCode } from '../types';
import { Gift, Send, Heart, Star, Sparkles, User, Info } from 'lucide-react';
import { EXCHANGE_RATES, CURRENCY_SYMBOLS } from '../constants';

interface Props {
  availableGrams: number;
  currentRate: number;
  currency: CurrencyCode;
  onSend: (grams: number, metadata: GiftMetadata) => void;
}

const GiftingModule: React.FC<Props> = ({ availableGrams, currentRate, currency, onSend }) => {
  const [step, setStep] = useState(1);
  const [amountType, setAmountType] = useState<'GRAMS' | 'CURRENCY'>('GRAMS');
  const [inputValue, setInputValue] = useState('0.1');
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState<GiftMetadata['theme']>('GENERAL');

  const gramsToSend = amountType === 'GRAMS' 
    ? parseFloat(inputValue) 
    : (parseFloat(inputValue) / EXCHANGE_RATES[currency]) / currentRate;

  const themes: { id: GiftMetadata['theme'], icon: any, color: string }[] = [
    { id: 'GENERAL', icon: Gift, color: 'bg-indigo-500' },
    { id: 'BIRTHDAY', icon: Star, color: 'bg-yellow-500' },
    { id: 'WEDDING', icon: Heart, color: 'bg-rose-500' },
    { id: 'FESTIVAL', icon: Sparkles, color: 'bg-orange-500' },
  ];

  const handleSend = () => {
    onSend(gramsToSend, { recipientName: recipient, message, theme });
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">How much gold to gift?</label>
            <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
              <button 
                onClick={() => setAmountType('GRAMS')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${amountType === 'GRAMS' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >Grams</button>
              <button 
                onClick={() => setAmountType('CURRENCY')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${amountType === 'CURRENCY' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
              >{currency}</button>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                {amountType === 'GRAMS' ? 'gms' : currency}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Available: {availableGrams} gms (~{CURRENCY_SYMBOLS[currency]}{(availableGrams * currentRate * EXCHANGE_RATES[currency]).toLocaleString()})
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">To Whom?</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Recipient Name or Phone"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <button 
            disabled={!recipient || gramsToSend <= 0 || gramsToSend > availableGrams}
            onClick={() => setStep(2)}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-slate-300 text-white font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Next: Personalize <Send className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Choose a Theme</label>
            <div className="grid grid-cols-4 gap-3">
              {themes.map(t => (
                <button 
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${theme === t.id ? 'border-rose-500 bg-rose-50' : 'border-slate-100 bg-slate-50 opacity-60'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${t.color}`}>
                    <t.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-600">{t.id}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">A Personal Note</label>
            <textarea 
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Here is some real gold for your future!"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl text-white">
            <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-3">
              <span className="text-xs text-slate-400 font-bold uppercase">Gifting Summary</span>
              <Gift className="w-4 h-4 text-rose-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Gold Weight</span>
                <span className="font-bold">{gramsToSend.toFixed(4)} gms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Value</span>
                <span className="font-bold">{CURRENCY_SYMBOLS[currency]}{(gramsToSend * currentRate * EXCHANGE_RATES[currency]).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Recipient</span>
                <span className="font-bold">{recipient}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setStep(1)} className="flex-1 py-4 font-bold text-slate-500">Back</button>
            <button onClick={handleSend} className="flex-[2] bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all">
              Send Gift Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftingModule;
