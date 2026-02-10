
import React, { useState, useEffect, useMemo } from 'react';
import { 
  History, 
  Calculator, 
  ShoppingBag,
  LayoutDashboard,
  LogOut,
  Clock
} from 'lucide-react';
import { INITIAL_GOLD_RATE, MOCK_TRANSACTIONS, EXCHANGE_RATES, MOCK_JEWELRY, MOCK_USERS } from './constants';
import { GoldRate, Transaction, UserStats, CalculationConstants, CurrencyCode, User, JewelryItem, Booking, AuditLog } from './types';
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
import ActiveBookings from './components/ActiveBookings';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRate, setCurrentRate] = useState<GoldRate>(INITIAL_GOLD_RATE);
  const [globalRate, setGlobalRate] = useState<number>(INITIAL_GOLD_RATE.price24k);
  const [useOverrideRate, setUseOverrideRate] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'calculator' | 'gift' | 'store' | 'admin' | 'bookings'>('dashboard');
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [inventory, setInventory] = useState<JewelryItem[]>(MOCK_JEWELRY);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Persistence Simulation
  useEffect(() => {
    const savedUser = localStorage.getItem('aurum_user');
    const savedBookings = localStorage.getItem('aurum_bookings');
    const savedLogs = localStorage.getItem('aurum_logs');
    const savedInventory = localStorage.getItem('aurum_inventory');
    const savedUsers = localStorage.getItem('aurum_users_list');
    
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedBookings) setBookings(JSON.parse(savedBookings));
    if (savedLogs) setAuditLogs(JSON.parse(savedLogs));
    if (savedInventory) setInventory(JSON.parse(savedInventory));
    if (savedUsers) setUsers(JSON.parse(savedUsers));
    
    setIsAuthLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem('aurum_bookings', JSON.stringify(bookings));
    localStorage.setItem('aurum_logs', JSON.stringify(auditLogs));
    localStorage.setItem('aurum_inventory', JSON.stringify(inventory));
    localStorage.setItem('aurum_users_list', JSON.stringify(users));
  }, [bookings, auditLogs, inventory, users]);

  // Market Engine Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobalRate(prev => prev + (Math.random() - 0.5) * 15);
      
      if (!useOverrideRate) {
        setCurrentRate(prev => {
          const new24k = globalRate;
          return {
            ...prev,
            price24k: new24k,
            price22k: new24k * 0.916,
            timestamp: new Date().toISOString()
          };
        });
      }

      // Auto-Restocking for expired bookings
      setBookings(prev => {
        const now = new Date();
        let changed = false;
        const next = prev.map(b => {
          if (b.status === 'ACTIVE' && new Date(b.expiresAt) < now) {
            changed = true;
            return { ...b, status: 'EXPIRED' as const };
          }
          return b;
        });
        if (changed) {
          setInventory(inv => inv.map(item => {
            const expiredItemsCount = prev.filter(b => b.status === 'ACTIVE' && new Date(b.expiresAt) < now && b.itemId === item.id).length;
            if (expiredItemsCount > 0) {
              return { ...item, stock: item.stock + expiredItemsCount };
            }
            return item;
          }));
        }
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [inventory, useOverrideRate, globalRate]);

  const addAuditLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      adminId: currentUser?.id || 'system',
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 100));
  };

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

  const adminStats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayTxs = transactions.filter(t => t.date === today);
    const revenueToday = todayTxs.reduce((acc, t) => acc + (t.type === 'BUY' || t.type === 'JEWELRY_PURCHASE' ? t.amount : 0), 0);
    const goldAccumulatedToday = todayTxs.reduce((acc, t) => acc + (t.type === 'BUY' ? t.grams : 0), 0);
    const activeReservations = bookings.filter(b => b.status === 'ACTIVE').length;
    
    // Total liability: Sum of all user gold balances
    const totalGoldLiability = users.reduce((acc, u) => acc + u.goldBalance, 0);

    return { revenueToday, goldAccumulatedToday, activeReservations, totalGoldLiability };
  }, [transactions, bookings, users]);

  const userStats = useMemo<UserStats>(() => {
    const totalGrams = transactions.reduce((acc, t) => {
      if (t.type === 'BUY' || t.type === 'BONUS' || t.type === 'GIFT_RECEIVED') return acc + t.grams;
      if (t.type === 'REDEEM' || t.type === 'GIFT_SENT' || t.type === 'JEWELRY_PURCHASE' || t.type === 'BOOKING_COLLATERAL') return acc - t.grams;
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
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i));
    setActiveTab('history');
  };

  const handleReserve = (item: JewelryItem, type: 'CASH_ADVANCE' | 'GOLD_LOCK', collateralValue: number) => {
    const now = new Date();
    const expires = new Date(now.getTime() + CalculationConstants.BOOKING_DURATION_HOURS * 60 * 60 * 1000);
    
    const newBooking: Booking = {
      id: `BK-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      userId: currentUser?.id || 'anon',
      userName: currentUser?.name || 'Customer',
      userPhone: currentUser?.phone,
      itemId: item.id,
      itemName: item.name,
      itemSku: item.sku,
      collateralType: type,
      collateralValue: collateralValue,
      lockedPrice: currentRate.price24k,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: 'ACTIVE'
    };

    if (type === 'GOLD_LOCK') {
      const lockTx: Transaction = {
        id: `LOCK-${newBooking.id}`,
        date: now.toISOString().split('T')[0],
        amount: 0,
        grams: collateralValue,
        type: 'BOOKING_COLLATERAL',
        status: 'COMPLETED',
        rate: currentRate.price24k,
        currencyAtRuntime: currency,
        exchangeRateAtRuntime: EXCHANGE_RATES[currency],
        details: `Locked for ${item.name} reservation`
      };
      setTransactions(prev => [lockTx, ...prev]);
    }

    setBookings(prev => [newBooking, ...prev]);
    setInventory(prev => prev.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i));
    setActiveTab('bookings');
  };

  if (isAuthLoading) return null;
  if (!currentUser) return <Login onLogin={handleLogin} />;

  const userBookings = bookings.filter(b => b.userId === currentUser.id);

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
            globalRate={globalRate}
            useOverrideRate={useOverrideRate}
            setUseOverrideRate={setUseOverrideRate}
            inventory={inventory} 
            setInventory={setInventory}
            bookings={bookings}
            setBookings={setBookings}
            auditLogs={auditLogs}
            addAuditLog={addAuditLog}
            stats={adminStats}
            users={users}
            setUsers={setUsers}
            onLogout={handleLogout}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {activeTab === 'dashboard' && (
                <>
                  <Dashboard stats={userStats} scheme={{ name: "11+1 Scheme", durationMonths: 11, monthlyInstallment: 5000, monthsPaid: 3, nextDueDate: '05 Apr', isEligibleForBonus: false }} currency={currency} />
                  {userBookings.some(b => b.status === 'ACTIVE') && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-black">
                            <Clock className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-bold text-white">Active Reservations</p>
                            <p className="text-xs text-slate-400">You have designs held in the vault.</p>
                         </div>
                       </div>
                       <button onClick={() => setActiveTab('bookings')} className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-xs font-bold">View Holds</button>
                    </div>
                  )}
                  <MarketChart />
                </>
              )}
              {activeTab === 'store' && (
                <JewelryStore 
                  inventory={inventory.filter(i => i.isVisible && i.stock > 0)} 
                  currentRate={currentRate} 
                  userGrams={userStats.totalGrams} 
                  onPurchase={handlePurchase} 
                  onReserve={handleReserve}
                  currency={currency}
                />
              )}
              {activeTab === 'bookings' && (
                <ActiveBookings 
                  bookings={userBookings} 
                  currency={currency}
                  onVisitStore={() => setActiveTab('dashboard')}
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

      {currentUser.role !== 'ADMIN' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#161616] border-t border-white/5 px-6 py-3 flex justify-around items-center z-50">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-yellow-500' : 'text-slate-500'}`}>
            <LayoutDashboard className="w-6 h-6" />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button onClick={() => setActiveTab('store')} className={`flex flex-col items-center gap-1 ${activeTab === 'store' ? 'text-yellow-500' : 'text-slate-500'}`}>
            <ShoppingBag className="w-6 h-6" />
            <span className="text-[10px] font-medium">Atelier</span>
          </button>
          <button onClick={() => setActiveTab('bookings')} className={`flex flex-col items-center gap-1 ${activeTab === 'bookings' ? 'text-yellow-500' : 'text-slate-500'}`}>
            <Clock className="w-6 h-6" />
            <span className="text-[10px] font-medium">Holds</span>
          </button>
          <button onClick={() => setActiveTab('calculator')} className={`flex flex-col items-center gap-1 ${activeTab === 'calculator' ? 'text-yellow-500' : 'text-slate-500'}`}>
            <Calculator className="w-6 h-6" />
            <span className="text-[10px] font-medium">Invest</span>
          </button>
          <button onClick={() => setActiveTab('history')} className={`flex flex-col items-center gap-1 ${activeTab === 'history' ? 'text-yellow-500' : 'text-slate-500'}`}>
            <History className="w-6 h-6" />
            <span className="text-[10px] font-medium">History</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
