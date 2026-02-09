
import React, { useState } from 'react';
import { GoldRate, JewelryItem, Purity, Booking, AuditLog } from '../types';
import { 
  Settings, Plus, Save, Trash2, TrendingUp, Package, RefreshCw, 
  Eye, EyeOff, BarChart3, Clock, CheckCircle2, Search, Filter, 
  ArrowUpRight, Users, ClipboardList, ShieldAlert, History, 
  LayoutDashboard, LogOut, SearchIcon, QrCode, UserSearch, Timer, Edit3, X
} from 'lucide-react';

interface Props {
  currentRate: GoldRate;
  setCurrentRate: React.Dispatch<React.SetStateAction<GoldRate>>;
  globalRate: number;
  useOverrideRate: boolean;
  setUseOverrideRate: (v: boolean) => void;
  inventory: JewelryItem[];
  setInventory: React.Dispatch<React.SetStateAction<JewelryItem[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;
  stats: {
    revenueToday: number;
    goldAccumulatedToday: number;
    activeReservations: number;
    totalGoldLiability: number;
  };
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ 
  currentRate, setCurrentRate, globalRate, useOverrideRate, setUseOverrideRate,
  inventory, setInventory, bookings, setBookings, auditLogs, addAuditLog, stats, onLogout
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'DASHBOARD' | 'INVENTORY' | 'RESERVATIONS' | 'AUDIT'>('DASHBOARD');
  const [newRate, setNewRate] = useState(currentRate.price24k.toString());
  const [showForm, setShowForm] = useState<'ADD' | 'EDIT' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reservationSearch, setReservationSearch] = useState('');
  const [reservationStatusFilter, setReservationStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED'>('ALL');
  const [qrModalBookingId, setQrModalBookingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<JewelryItem | null>(null);
  
  const [formData, setFormData] = useState<Partial<JewelryItem>>({
    name: '',
    sku: '',
    weight: 0,
    purity: 22,
    makingCharges: 0,
    category: 'RING',
    stock: 10,
    isVisible: true,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400'
  });

  const handleUpdateRate = () => {
    const val = parseFloat(newRate);
    if (val > 0) {
      setCurrentRate(prev => ({
        ...prev,
        price24k: val,
        price22k: val * 0.916,
        timestamp: new Date().toISOString()
      }));
      setUseOverrideRate(true);
      addAuditLog("RATE_OVERRIDE", `Changed shop rate to ₹${val}/g (Manual Mode)`);
    }
  };

  const syncRate = () => {
    setUseOverrideRate(false);
    addAuditLog("RATE_SYNC", `Synchronized shop rate with Global Market (₹${globalRate.toFixed(2)}/g)`);
  };

  const handleSaveItem = () => {
    if (showForm === 'ADD') {
      const item: JewelryItem = {
        ...formData as JewelryItem,
        id: `j-${Date.now()}`,
        sku: formData.sku || `AUR-${formData.category?.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`
      };
      setInventory(prev => [...prev, item]);
      addAuditLog("STOCK_ADD", `Created Asset SKU: ${item.sku}`);
    } else if (showForm === 'EDIT' && editingItem) {
      setInventory(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData } as JewelryItem : i));
      addAuditLog("STOCK_EDIT", `Updated Asset SKU: ${editingItem.sku}`);
    }
    setShowForm(null);
    setEditingItem(null);
  };

  const openEdit = (item: JewelryItem) => {
    setEditingItem(item);
    setFormData(item);
    setShowForm('EDIT');
  };

  const toggleVisibility = (id: string) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
    const targetItem = inventory.find(i => i.id === id);
    if (targetItem) {
      addAuditLog("ASSET_VISIBILITY", `Toggled visibility for SKU: ${targetItem.sku}`);
    }
  };

  const confirmSale = (bookingId: string) => {
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'COMPLETED' as const } : b));
    addAuditLog("SALE_CONFIRMED", `Store sale finalized for Booking ${bookingId}`);
    setQrModalBookingId(null);
  };

  const extendBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const newExpiry = new Date(new Date(b.expiresAt).getTime() + 48 * 60 * 60 * 1000).toISOString();
        addAuditLog("HOLD_EXTEND", `Extended hold for ${b.userName} by 48 hours`);
        return { ...b, expiresAt: newExpiry };
      }
      return b;
    }));
  };

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReservations = bookings.filter(b => {
    const matchesSearch = b.userName.toLowerCase().includes(reservationSearch.toLowerCase()) || 
                          b.id.toLowerCase().includes(reservationSearch.toLowerCase()) ||
                          b.itemSku.toLowerCase().includes(reservationSearch.toLowerCase());
    const matchesStatus = reservationStatusFilter === 'ALL' || b.status === reservationStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* 1. Sidebar */}
      <aside className="lg:w-72 space-y-2 shrink-0">
        <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 p-4 mb-4">
           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Terminal Access</h2>
           <div className="space-y-1">
             <button 
               onClick={() => setActiveSubTab('DASHBOARD')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'DASHBOARD' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <LayoutDashboard className="w-5 h-5" /> Dashboard
             </button>
             <button 
               onClick={() => setActiveSubTab('INVENTORY')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'INVENTORY' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <Package className="w-5 h-5" /> Inventory
             </button>
             <button 
               onClick={() => setActiveSubTab('RESERVATIONS')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'RESERVATIONS' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <Clock className="w-5 h-5" /> Active Holds
             </button>
             <button 
               onClick={() => setActiveSubTab('AUDIT')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSubTab === 'AUDIT' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <History className="w-5 h-5" /> Audit Trail
             </button>
           </div>
        </div>
        <div className="p-4 border-t border-white/5">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
           >
             <LogOut className="w-5 h-5" /> Secure Logout
           </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 space-y-8">
        {/* Persistent Price Controller Banner */}
        <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <TrendingUp className="w-32 h-32 text-emerald-500" />
           </div>
           
           <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 shadow-inner">
                 <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Global Gold Spot</p>
                 <p className="text-2xl font-black text-white">₹{globalRate.toLocaleString(undefined, { maximumFractionDigits: 2 })}<span className="text-xs font-medium ml-1">/g</span></p>
              </div>
           </div>

           <div className="h-12 w-px bg-white/5 hidden md:block" />

           <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest leading-none mb-1">Today's Shop Selling Rate</p>
                {useOverrideRate && <span className="text-[9px] font-bold text-rose-500 animate-pulse">OVERRIDE ACTIVE</span>}
              </div>
              <div className="flex gap-3">
                 <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                    <input 
                       type="number" 
                       value={newRate}
                       onChange={(e) => setNewRate(e.target.value)}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-xl font-black text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                    />
                 </div>
                 <button 
                    onClick={handleUpdateRate}
                    className="bg-yellow-500 text-black px-8 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
                 >Commit Rate</button>
                 {useOverrideRate && (
                   <button 
                      onClick={syncRate}
                      className="bg-white/5 text-slate-400 border border-white/10 px-4 rounded-2xl hover:text-white transition-all"
                      title="Sync with Global"
                   ><RefreshCw className="w-5 h-5" /></button>
                 )}
              </div>
           </div>
        </div>

        {activeSubTab === 'DASHBOARD' && (
          <>
            {/* Real-Time Analytics Command Center */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Today's Revenue</p>
                  <p className="text-3xl font-black text-white">₹{stats.revenueToday.toLocaleString()}</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                     <ArrowUpRight className="w-3 h-3" /> Settlement Active
                  </div>
               </div>
               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Gold Accumulation</p>
                  <p className="text-3xl font-black text-white">{stats.goldAccumulatedToday.toFixed(3)}<span className="text-sm font-medium ml-1">gms</span></p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-yellow-500">
                     <Package className="w-3 h-3" /> New Deposits
                  </div>
               </div>
               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Active Holds</p>
                  <p className="text-3xl font-black text-white">{stats.activeReservations}</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400">
                     <Clock className="w-3 h-3" /> Pending Store Visits
                  </div>
               </div>
               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Gold Liability</p>
                  <p className="text-3xl font-black text-white">{stats.totalGoldLiability.toFixed(2)}<span className="text-sm font-medium ml-1">gms</span></p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-rose-400">
                     <ShieldAlert className="w-3 h-3" /> Total Digital Assets
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black flex items-center gap-2">
                       <ClipboardList className="w-5 h-5 text-indigo-500" />
                       Inventory Status
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {inventory.filter(i => i.stock < 10).length > 0 ? (
                      inventory.filter(i => i.stock < 10).slice(0, 3).map(i => (
                        <div key={i.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-rose-500/20">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-500/10 rounded-lg flex items-center justify-center text-rose-500 font-bold text-xs shrink-0">LOW</div>
                              <div>
                                 <p className="text-xs font-bold text-white">{i.name}</p>
                                 <p className="text-[9px] text-slate-500 uppercase">{i.sku}</p>
                              </div>
                           </div>
                           <p className="text-xs font-black text-rose-500 whitespace-nowrap">{i.stock} Units</p>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-500 font-bold">ALL SKUs SUFFICIENTLY STOCKED</p>
                      </div>
                    )}
                    <button onClick={() => setActiveSubTab('INVENTORY')} className="w-full py-4 text-xs font-bold text-slate-500 hover:text-white transition-colors">Manage Full Catalog</button>
                  </div>
               </div>

               <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 p-8">
                  <h3 className="text-lg font-black mb-8 flex items-center gap-2">
                     <Timer className="w-5 h-5 text-yellow-500" />
                     Priority Reservations
                  </h3>
                  <div className="space-y-4">
                    {bookings.filter(b => b.status === 'ACTIVE').length > 0 ? (
                      bookings.filter(b => b.status === 'ACTIVE').slice(0, 3).map(b => (
                        <div key={b.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
                           <div>
                              <p className="text-xs font-bold text-white">{b.userName}</p>
                              <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{b.itemName}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[9px] text-rose-500 font-black uppercase">Expires</p>
                              <p className="text-xs font-bold text-white">{new Date(b.expiresAt).toLocaleTimeString()}</p>
                           </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-xs text-slate-500 font-bold">NO ACTIVE RESERVATIONS</p>
                      </div>
                    )}
                    <button onClick={() => setActiveSubTab('RESERVATIONS')} className="w-full py-4 text-xs font-bold text-slate-500 hover:text-white transition-colors">Full Visitor Log</button>
                  </div>
               </div>
            </div>
          </>
        )}

        {activeSubTab === 'INVENTORY' && (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                   <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                      type="text" 
                      placeholder="Search SKU or Product Name..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-[1.5rem] pl-12 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-xl"
                   />
                </div>
                <button 
                   onClick={() => { setShowForm('ADD'); setFormData({ name: '', sku: '', weight: 0, purity: 22, makingCharges: 0, category: 'RING', stock: 10, isVisible: true, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400' }); }}
                   className="bg-white text-black font-black px-10 py-5 rounded-[1.5rem] flex items-center gap-3 hover:bg-yellow-500 transition-all shadow-xl"
                >
                   <Plus className="w-5 h-5" /> Provision Stock
                </button>
             </div>

             <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                           <th className="p-8">Design Information</th>
                           <th className="p-8">Metal Details</th>
                           <th className="p-8">Today's Price</th>
                           <th className="p-8">Store Stock</th>
                           <th className="p-8">Terminal Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredInventory.map(item => {
                           const purityMultiplier = item.purity === 24 ? 1 : item.purity === 22 ? 0.916 : 0.75;
                           const liveRetail = (currentRate.price24k * purityMultiplier * item.weight + item.makingCharges) * 1.03;
                           return (
                             <tr key={item.id} className={`group transition-all ${!item.isVisible ? 'opacity-30 grayscale' : 'hover:bg-white/[0.02]'}`}>
                                <td className="p-8">
                                   <div className="flex items-center gap-4">
                                      <img src={item.image} className="w-14 h-14 rounded-2xl object-cover shadow-lg" />
                                      <div>
                                         <p className="text-sm font-black text-white">{item.name}</p>
                                         <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">{item.sku}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-8">
                                   <p className="text-sm font-bold text-yellow-500">{item.purity}K Purified</p>
                                   <p className="text-[10px] text-slate-500 font-medium">{item.weight}g weight</p>
                                </td>
                                <td className="p-8">
                                   <p className="text-sm font-black text-white">₹{liveRetail.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                   <p className="text-[9px] text-slate-500 uppercase font-bold">M.Charge: ₹{item.makingCharges}</p>
                                </td>
                                <td className="p-8">
                                   <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${item.stock > 10 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`} />
                                      <p className="text-xs font-bold text-white">{item.stock} Units</p>
                                   </div>
                                </td>
                                <td className="p-8">
                                   <div className="flex items-center gap-4">
                                      <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Edit Design">
                                         <Edit3 className="w-5 h-5" />
                                      </button>
                                      <button onClick={() => toggleVisibility(item.id)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Toggle Visibility">
                                         {item.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                      </button>
                                      <button onClick={() => setInventory(prev => prev.filter(i => i.id !== item.id))} className="p-2 text-slate-400 hover:text-rose-500 transition-colors" title="Delete Permanent">
                                         <Trash2 className="w-5 h-5" />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                           );
                        })}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeSubTab === 'RESERVATIONS' && (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row gap-4 items-center bg-[#1a1a1a] p-4 rounded-[1.5rem] border border-white/5 shadow-xl">
                <div className="flex-1 flex items-center gap-4 px-4 border-r border-white/5">
                   <UserSearch className="w-5 h-5 text-slate-500" />
                   <input 
                      placeholder="Search Visitor, SKU, or Phone..." 
                      className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                      value={reservationSearch}
                      onChange={(e) => setReservationSearch(e.target.value)}
                   />
                </div>
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                   {(['ALL', 'ACTIVE', 'COMPLETED', 'EXPIRED'] as const).map(f => (
                     <button 
                        key={f}
                        onClick={() => setReservationStatusFilter(f)}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all ${reservationStatusFilter === f ? 'bg-yellow-500 text-black' : 'text-slate-500 hover:text-white'}`}
                     >{f}</button>
                   ))}
                </div>
             </div>

             <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                           <th className="p-8">Customer Detail</th>
                           <th className="p-8">Security Hold</th>
                           <th className="p-8">Time Left</th>
                           <th className="p-8">Status</th>
                           <th className="p-8">Verification Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredReservations.map(b => (
                          <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="p-8">
                                <div>
                                   <p className="text-sm font-black text-white">{b.userName}</p>
                                   <p className="text-[10px] text-slate-500 mb-2">{b.userPhone || 'Walk-in Profile'}</p>
                                   <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-black rounded-lg uppercase tracking-widest border border-yellow-500/20">{b.itemSku}</span>
                                </div>
                             </td>
                             <td className="p-8">
                                <p className="text-sm font-black text-white">
                                   {b.collateralType === 'CASH_ADVANCE' ? `$${b.collateralValue}` : `${b.collateralValue}g locked`}
                                </p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase">Rate Locked: ₹{b.lockedPrice.toLocaleString()}</p>
                             </td>
                             <td className="p-8">
                                <p className="text-sm font-bold text-rose-500">
                                   {new Date(b.expiresAt).toLocaleDateString()}
                                </p>
                                <p className="text-[10px] text-slate-500">Expiry: {new Date(b.expiresAt).toLocaleTimeString()}</p>
                             </td>
                             <td className="p-8">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border ${
                                  b.status === 'ACTIVE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                  b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                  {b.status}
                                </span>
                             </td>
                             <td className="p-8">
                                {b.status === 'ACTIVE' && (
                                   <div className="flex gap-3">
                                      <button 
                                         onClick={() => setQrModalBookingId(b.id)}
                                         className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-yellow-500 transition-all shadow-xl"
                                      >
                                         <QrCode className="w-4 h-4" /> Verify
                                      </button>
                                      <button 
                                         onClick={() => extendBooking(b.id)}
                                         className="bg-white/5 text-slate-400 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all"
                                      >
                                         Extend
                                      </button>
                                   </div>
                                )}
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeSubTab === 'AUDIT' && (
          <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 text-rose-500">
                   <ShieldAlert className="w-6 h-6" />
                   Vault Operations Audit Log
                </h3>
             </div>
             <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-start gap-6 hover:bg-white/[0.05] transition-all">
                     <div className={`mt-2 w-3 h-3 rounded-full shrink-0 shadow-lg ${log.action.includes('RATE') ? 'bg-rose-500 shadow-rose-500/20' : 'bg-indigo-500 shadow-indigo-500/20'}`} />
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                           <p className="text-xs font-black text-white tracking-widest">{log.action}</p>
                           <p className="text-[10px] text-slate-500 font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{log.details}</p>
                        <p className="text-[9px] text-slate-600 font-black uppercase mt-3">Auth Admin ID: {log.adminId}</p>
                     </div>
                  </div>
                ))}
                {auditLogs.length === 0 && <p className="text-center py-20 text-slate-600 font-black tracking-widest">TERMINAL AUDIT CLEAR</p>}
             </div>
          </div>
        )}
      </div>

      {/* Manual Verification Overlay */}
      {qrModalBookingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[3rem] border border-white/10 p-12 shadow-2xl text-center relative">
             <button onClick={() => setQrModalBookingId(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
             <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                <QrCode className="w-12 h-12" />
             </div>
             <h3 className="text-3xl font-black mb-4">Verification Success</h3>
             <p className="text-slate-400 mb-10 leading-relaxed">Identity and reservation match. Confirm physical inventory release to finalize the customer ledger.</p>
             
             <div className="bg-white/5 p-8 rounded-[2rem] mb-10 border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Authenticated Ticket</p>
                <p className="text-2xl font-black text-white tracking-[0.2em]">{qrModalBookingId}</p>
             </div>

             <div className="space-y-4">
               <button 
                 onClick={() => confirmSale(qrModalBookingId)}
                 className="w-full bg-emerald-500 text-black font-black py-6 rounded-3xl text-xl shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all"
               >Complete Asset Release</button>
               <button 
                 onClick={() => setQrModalBookingId(null)}
                 className="w-full text-slate-500 font-black text-sm uppercase tracking-widest py-3"
               >Abort Verification</button>
             </div>
          </div>
        </div>
      )}

      {/* Item Provisioning Modal (Add/Edit) */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
          <div className="bg-[#1a1a1a] w-full max-w-xl rounded-[3rem] border border-white/10 p-12 shadow-2xl overflow-y-auto max-h-[95vh] relative">
            <button onClick={() => setShowForm(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
            <h3 className="text-3xl font-black mb-10 flex items-center gap-4">
              <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500"><Package className="w-6 h-6" /></div>
              {showForm === 'ADD' ? 'Provision New Asset' : 'Modify Existing Design'}
            </h3>
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Identity & Meta</label>
                <input 
                  placeholder="Design Title (e.g. Imperial Bracelet)" 
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
                <input 
                  placeholder="Master SKU Code" 
                  className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-indigo-400 font-black text-xs tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={formData.sku}
                  onChange={e => setFormData({...formData, sku: e.target.value})}
                  disabled={showForm === 'EDIT'}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Mass (Grams)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formData.weight}
                    onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Purity Grade</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none"
                    value={formData.purity}
                    onChange={e => setFormData({...formData, purity: parseInt(e.target.value) as Purity})}
                  >
                    <option value="22">22K Fine Gold</option>
                    <option value="24">24K Bullion Quality</option>
                    <option value="18">18K Luxury Grade</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Labor/Making (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formData.makingCharges}
                    onChange={e => setFormData({...formData, makingCharges: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Available Stock</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] px-6 py-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {/* Dynamic Price Calculation Overlay */}
              <div className="p-8 bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] shadow-inner">
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">Real-time Retail Estimate</p>
                    <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg uppercase">3% GST Included</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-3xl font-black text-white">₹{
                         (((currentRate.price24k * (formData.purity === 24 ? 1 : formData.purity === 22 ? 0.916 : 0.75) * (formData.weight || 0)) + (formData.makingCharges || 0)) * 1.03).toLocaleString(undefined, { maximumFractionDigits: 0 })
                       }</p>
                       <p className="text-[10px] text-slate-500 font-medium">Auto-calibrated at Shop Rate</p>
                    </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button 
                   onClick={handleSaveItem}
                   className="flex-[2] bg-white text-black font-black py-6 rounded-[2rem] text-xl shadow-2xl hover:bg-yellow-500 transition-all active:scale-95"
                 >
                   {showForm === 'ADD' ? 'Commit Design' : 'Update Catalog'}
                 </button>
                 <button onClick={() => setShowForm(null)} className="flex-1 text-slate-500 font-black text-sm uppercase tracking-widest hover:text-white transition-colors">Discard</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
