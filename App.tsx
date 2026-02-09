
import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Calculator, 
  ShoppingBag,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { INITIAL_GOLD_RATE, MOCK_TRANSACTIONS, EXCHANGE_RATES, MOCK_JEWELRY } from './constants';
import { GoldRate, Transaction, UserStats, CalculationConstants, CurrencyCode, User, JewelryItem } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import MarketChart from './components/MarketChart';
import InvestmentForm from './components/InvestmentForm';
import TransactionHistory from './components/TransactionHistory';
import AIAssistant from './components/AIAssistant';
import GiftingModule from './components/GiftingModule';
import LoyaltyTracker from './components/LoyaltyTracker';
import JewelryStore from './components/JewelryStore';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRate, setCurrentRate] = useState<GoldRate>(INITIAL_GOLD_RATE);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'calculator' | 'gift' | 'store' | 'admin'>('dashboard');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [inventory, setInventory] = useState<JewelryItem[]>(MOCK_JEWELRY);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Persistence Simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('aurum_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate(prev => ({
        ...prev,
        price24k: prev.price24k + (Math.random() - 0.5) * 10,
        price22k: (prev.price24k + (Math.random() - 0.5) * 10) * 0.916,
        timestamp: new Date().toISOString()
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('aurum_user', JSON.stringify(user));
    setActiveTab(user.role === 'ADMIN' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('aurum_user');
    setActiveTab('dashboard');
  };

  const userStats = useMemo<UserStats>(() => {
    const totalGrams = transactions.reduce((acc, t) => {
      if (t.type === 'BUY' || t.type === 'BONUS' || t.type === 'GIFT_RECEIVED') return acc + t.grams;
      if (t.type === 'REDEEM' || t.type === 'GIFT_SENT' || t.type === 'JEWELRY_PURCHASE') return acc - t.grams;
      return acc;
    }, currentUser?.goldBalance || 0);
    
    const totalInvested = transactions.reduce((acc, t) => acc + (t.type === 'BUY' ? t.amount : 0), 0);
    const currentValue = totalGrams * currentRate.price24k;
    const unrealizedGain = currentValue - totalInvested;
    const gainPercentage = totalInvested > 0 ? (unrealizedGain / totalInvested) * 100 : 0;

    const buysCount = transactions.filter(t => t.type === 'BUY').length;
    let tier: 'SILVER' | 'GOLD' | 'PLATINUM' = 'SILVER';
    if (buysCount > 10) tier = 'PLATINUM';
    else if (buysCount > 5) tier = 'GOLD';

    return {
      totalInvested,
      totalGrams: parseFloat(totalGrams.toFixed(4)),
      currentValue: parseFloat(currentValue.toFixed(2)),
      unrealizedGain: parseFloat(unrealizedGain.toFixed(2)),
      gainPercentage: parseFloat(gainPercentage.toFixed(2)),
      loyaltyTier: tier,
      currentStreak: buysCount
    };
  }, [transactions, currentRate, currentUser]);

  const handleInvestment = (amount: number) => {
    const netAmount = amount / (1 + CalculationConstants.GST_PERCENTAGE + CalculationConstants.PROCESSING_FEE_PERCENTAGE);
    const grams = netAmount / currentRate.price24k;
    
    const newTx: Transaction = {
      id: `TX-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      amount,
      grams: parseFloat(grams.toFixed(4)),
      type: 'BUY',
      status: 'COMPLETED',
      rate: currentRate.price24k,
      currencyAtRuntime: currency,
      exchangeRateAtRuntime: EXCHANGE_RATES[currency]
    };

    setTransactions(prev => [newTx, ...prev]);
    setActiveTab('dashboard');
  };

  const handlePurchase = (item: JewelryItem, goldUsed: number, cashPaid: number) => {
    const newTx: Transaction = {
      id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString().split('T')[0],
      amount: cashPaid,
      grams: goldUsed,
      type: 'JEWELRY_PURCHASE',
      status: 'COMPLETED',
      rate: currentRate.price24k,
      currencyAtRuntime: currency,
      exchangeRateAtRuntime: EXCHANGE_RATES[currency],
      details: `Purchased ${item.name}`
    };

    setTransactions(prev => [newTx, ...prev]);
    setActiveTab('history');
  };

  if (isAuthLoading) return null;
  if (!currentUser) return <Login onLogin={handleLogin} />;

  return (
    <div className="min-h-screen pb-20 md:pb-0 bg-[#0f0f0f] text-slate-100">
      <Header 
        currentRate={currentRate} 
        currency={currency} 
        setCurrency={setCurrency} 
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentUser.role === 'ADMIN' ? (
          <AdminPanel 
            currentRate={currentRate} 
            setCurrentRate={setCurrentRate} 
            inventory={inventory} 
            setInventory={setInventory} 
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {activeTab === 'dashboard' && (
                <>
                  <Dashboard stats={userStats} scheme={{ name: "11+1 Scheme", durationMonths: 11, monthlyInstallment: 5000, monthsPaid: 3, nextDueDate: '05 Apr', isEligibleForBonus: false }} currency={currency} />
                  <MarketChart />
                </>
              )}
              {activeTab === 'store' && (
                <JewelryStore 
                  inventory={inventory.filter(i => i.isVisible && i.stock > 0)} 
                  currentRate={currentRate} 
                  userGrams={userStats.totalGrams} 
                  onPurchase={handlePurchase} 
                  currency={currency}
                />
              )}
              {activeTab === 'history' && (
                <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
                  <h3 className="text-xl font-bold mb-6">Ledger</h3>
                  <TransactionHistory transactions={transactions} />
                </div>
              )}
              {activeTab === 'calculator' && <InvestmentForm currentRate={currentRate} onInvest={handleInvestment} />}
              {activeTab === 'gift' && <GiftingModule availableGrams={userStats.totalGrams} currentRate={currentRate.price24k} onSend={() => {}} currency={currency} />}
            </div>

            <div className="space-y-8">
              <AIAssistant userStats={userStats} currentRate={currentRate.price24k} currency={currency} />
              <LoyaltyTracker tier={userStats.loyaltyTier} streak={userStats.currentStreak} />
            </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#161616] border-t border-white/5 px-6 py-3 flex justify-around items-center z-50">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-yellow-500' : 'text-slate-500'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </button>
        <button onClick={() => setActiveTab('store')} className={`flex flex-col items-center gap-1 ${activeTab === 'store' ? 'text-yellow-500' : 'text-slate-500'}`}>
          <ShoppingBag className="w-6 h-6" />
          <span className="text-[10px] font-medium">Atelier</span>
        </button>
        <button onClick={() => setActiveTab('calculator')} className={`flex flex-col items-center gap-1 ${activeTab === 'calculator' ? 'text-yellow-500' : 'text-slate-500'}`}>
          <Calculator className="w-6 h-6" />
          <span className="text-[10px] font-medium">Invest</span>
        </button>
        {currentUser.role === 'ADMIN' ? (
          <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-yellow-500' : 'text-slate-500'}`}>
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Admin</span>
          </button>
        ) : (
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-yellow-500' : 'text-slate-500'}`}>
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default App;
