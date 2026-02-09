
import React from 'react';
import { Transaction } from '../types';
import { ArrowDownLeft, ArrowUpRight, Award } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<Props> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-slate-400 font-medium">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            <th className="pb-3 px-2">Type</th>
            <th className="pb-3 px-2">Amount</th>
            <th className="pb-3 px-2">Weight</th>
            <th className="pb-3 px-2 hidden sm:table-cell">Rate</th>
            <th className="pb-3 px-2 text-right">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {transactions.map((t) => (
            <tr key={t.id} className="group hover:bg-slate-50 transition-colors">
              <td className="py-4 px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    t.type === 'BUY' ? 'bg-emerald-50 text-emerald-600' : 
                    t.type === 'BONUS' ? 'bg-indigo-50 text-indigo-600' : 
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {t.type === 'BUY' ? <ArrowDownLeft className="w-4 h-4" /> : 
                     t.type === 'BONUS' ? <Award className="w-4 h-4" /> : 
                     <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{t.type}</p>
                    <p className="text-[10px] text-slate-400 font-bold">Ref: {t.id}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-slate-900">₹{t.amount.toLocaleString()}</p>
              </td>
              <td className="py-4 px-2">
                <p className="text-sm font-bold text-indigo-600">+{t.grams}g</p>
              </td>
              <td className="py-4 px-2 hidden sm:table-cell">
                <p className="text-xs text-slate-500">₹{t.rate.toLocaleString()}/g</p>
              </td>
              <td className="py-4 px-2 text-right">
                <p className="text-xs text-slate-500 font-medium">{t.date}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
