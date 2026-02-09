
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  Wallet, 
  History, 
  Calculator, 
  ShieldCheck, 
  Coins,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';
import { INITIAL_GOLD_RATE, MOCK_TRANSACTIONS } from './constants';
import { GoldRate, Transaction, UserStats, SchemeInfo, CalculationConstants } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MarketChart from './components/MarketChart';
import InvestmentForm from './components/InvestmentForm';
import TransactionHistory from './components/TransactionHistory';
import AIAssistant from './components/AIAssistant';

const App: React.FC = () => {
  const [currentRate, setCurrentRate] = useState<GoldRate>(INITIAL_GOLD_RATE);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS as Transaction[]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'calculator'>('dashboard');

  // Simulate real-time rate fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate(prev => ({
        ...prev,
        price24k: prev.price24k + (Math.random() - 0.5) * 10,
        price22k: prev.price22k + (Math.random() - 0.5) * 8,
        timestamp: new Date().toISOString()
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const userStats = useMemo<UserStats>(() => {
    const totalGrams = transactions.reduce((acc, t) => acc + (t.type === 'BUY' || t.type === 'BONUS' ? t.grams : -t.grams), 0);
    const totalInvested = transactions.reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : 0), 0);
    const currentValue = totalGrams * currentRate.price24k;
    const unrealizedGain = currentValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalGrams: parseFloat(totalGrams.toFixed(4)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      unrealizedGain: parseFloat(unrealizedGain.toFixed(2)),
      gainPercentage: parseFloat(gainPercentage.toFixed(2))
    };
  }, [transactions, currentRate]);

  const schemeInfo: SchemeInfo = {
    name: "Aurum 11+1 Benefit",
    durationMonths: 11,
    monthlyInstallment: 5000,
    monthsPaid: 3,
    nextDueDate: "2024-04-05",
    isEligibleForBonus: false
  };

  const handleInvestment = (amount: number) => {
    const netAmount = amount / (1 + CalculationConstants.GST_PERCENTAGE + CalculationConstants.PROCESSING_FEE_PERCENTAGE);
    const grams = netAmount / currentRate.price24k;
    
    const newTx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      amount,
      grams: parseFloat(grams.toFixed(4)),
      type: 'BUY',
      status: 'COMPLETED',
      rate: currentRate.price24k
    };

    setTransactions(prev => [newTx, ...prev]);
    setActiveTab('dashboard');
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Header currentRate={currentRate} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {activeTab === 'dashboard' && (
              <>
                <Dashboard stats={userStats} scheme={schemeInfo} />
                <MarketChart />
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-indigo-600" />
                    Recent Activity
                  </h3>
                  <TransactionHistory transactions={transactions.slice(0, 3)} />
                  <button 
                    onClick={() => setActiveTab('history')}
                    className="w-full mt-4 text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors flex items-center justify-center gap-1"
                  >
                    View All History <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[600px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-slate-900">Transaction Ledger</h3>
                  <button onClick={() => setActiveTab('dashboard')} className="text-sm text-slate-500 hover:text-slate-700">Back to Home</button>
                </div>
                <TransactionHistory transactions={transactions} />
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 min-h-[600px]">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Investment Calculator</h3>
                <InvestmentForm currentRate={currentRate} onInvest={handleInvestment} />
              </div>
            )}
          </div>

          {/* Sidebar / Tools */}
          <div className="space-y-8">
            <AIAssistant userStats={userStats} currentRate={currentRate.price24k} />
            
            {/* Quick Invest Widget */}
            <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  Quick Top-up
                </h3>
                <p className="text-indigo-200 text-sm mb-6">Build your gold vault daily. No hidden lock-ins.</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {[500, 1000, 2000, 5000].map(amt => (
                    <button 
                      key={amt}
                      onClick={() => handleInvestment(amt)}
                      className="bg-white/10 hover:bg-white/20 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setActiveTab('calculator')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-950 font-bold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Custom Amount <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            </div>

            {/* Educational / Trust Widget */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Secure Vaults
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your digital gold is backed by physical 24K (99.9% purity) gold stored in 100% insured BRINKS vaults. You can request physical delivery or redeem for jewelry anytime.
              </p>
            </div>
          </div>

        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex justify-around items-center md:hidden z-50">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] font-medium">Market</span>
        </button>
        <button 
          onClick={() => setActiveTab('calculator')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'calculator' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Calculator className="w-6 h-6" />
          <span className="text-[10px] font-medium">Invest</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <History className="w-6 h-6" />
          <span className="text-[10px] font-medium">Ledger</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
