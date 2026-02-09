
import React from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, Award, ShoppingBag } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<Props> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400 font-medium">No records found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <th className="pb-3 px-2">Type</th>
            <th className="pb-3 px-2">Value</th>
            <th className="pb-3 px-2">Metal Weight</th>
            <th className="pb-3 px-2 text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {transactions.map((t) => (
            <tr key={t.id} className="group hover:bg-white/5 transition-colors">
              <td className="py-4 px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    t.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 
                    t.type === 'JEWELRY_PURCHASE' ? 'bg-yellow-500/10 text-yellow-500' :
                    t.type === 'BONUS' ? 'bg-indigo-500/10 text-indigo-500' : 
                    'bg-rose-500/10 text-rose-500'
                  }`}>
                    {t.type === 'BUY' ? <ArrowDownLeft className="w-4 h-4" /> : 
                     t.type === 'JEWELRY_PURCHASE' ? <ShoppingBag className="w-4 h-4" /> :
                     t.type === 'BONUS' ? <Award className="w-4 h-4" /> : 
                     <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{t.type.replace('_', ' ')}</p>
                    <p className="text-[9px] text-slate-500 font-medium">{t.details || t.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-2">
                <p className="text-xs font-bold text-white">₹{t.amount.toLocaleString()}</p>
              </td>
              <td className="py-4 px-2">
                <p className={`text-xs font-bold ${t.type === 'JEWELRY_PURCHASE' ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {t.type === 'JEWELRY_PURCHASE' ? '-' : '+'}{t.grams}g
                </p>
              </td>
              <td className="py-4 px-2 text-right">
                <p className="text-[10px] text-slate-500 font-medium">{t.date}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
