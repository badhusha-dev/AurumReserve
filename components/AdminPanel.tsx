
import React, { useState } from 'react';
import { GoldRate, JewelryItem, Purity, Booking, AuditLog } from '../types';
import { 
  Settings, Plus, Save, Trash2, TrendingUp, Package, RefreshCw, 
  Eye, EyeOff, BarChart3, Clock, CheckCircle2, Search, Filter, 
  ArrowUpRight, Users, ClipboardList, ShieldAlert, History
} from 'lucide-react';

interface Props {
  currentRate: GoldRate;
  setCurrentRate: React.Dispatch<React.SetStateAction<GoldRate>>;
  inventory: JewelryItem[];
  setInventory: React.Dispatch<React.SetStateAction<JewelryItem[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string) => void;
}

const AdminPanel: React.FC<Props> = ({ 
  currentRate, setCurrentRate, inventory, setInventory, bookings, setBookings, auditLogs, addAuditLog 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'INVENTORY' | 'HOLDS' | 'LOGS'>('OVERVIEW');
  const [newRate, setNewRate] = useState(currentRate.price24k.toString());
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newItem, setNewItem] = useState<Partial<JewelryItem>>({
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
      addAuditLog("RATE_OVERRIDE", `Changed 24K rate to ₹${val}/g`);
    }
  };

  const handleAddItem = () => {
    const item: JewelryItem = {
      ...newItem as JewelryItem,
      id: `j-${Date.now()}`,
      sku: newItem.sku || `AUR-${newItem.category?.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`
    };
    setInventory(prev => [...prev, item]);
    addAuditLog("STOCK_ADD", `Added new SKU: ${item.sku} - ${item.name}`);
    setShowAddForm(false);
  };

  const toggleVisibility = (id: string) => {
    setInventory(prev => prev.map(item => {
      if (item.id === id) {
        addAuditLog("STOCK_VISIBILITY", `Toggled visibility for ${item.sku}`);
        return { ...item, isVisible: !item.isVisible };
      }
      return item;
    }));
  };

  const confirmSale = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        addAuditLog("RESERVATION_COMPLETE", `Confirmed store sale for Booking ${b.id}`);
        return { ...b, status: 'COMPLETED' as const };
      }
      return b;
    }));
  };

  const extendBooking = (bookingId: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const newExpiry = new Date(new Date(b.expiresAt).getTime() + 48 * 60 * 60 * 1000).toISOString();
        addAuditLog("RESERVATION_EXTEND", `Extended expiry for Booking ${b.id} to ${newExpiry}`);
        return { ...b, expiresAt: newExpiry };
      }
      return b;
    }));
  };

  const totalInventoryValue = inventory.reduce((acc, item) => {
    const purityMultiplier = item.purity === 24 ? 1 : item.purity === 22 ? 0.916 : 0.75;
    const val = (currentRate.price24k * purityMultiplier * item.weight + item.makingCharges) * 1.03;
    return acc + (val * item.stock);
  }, 0);

  const filteredInventory = inventory.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Global Command Banner */}
      <div className="bg-indigo-900/50 backdrop-blur-md border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center justify-between">
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
               <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Global Terminal Active</span>
            </div>
            <div className="h-4 w-px bg-indigo-500/20" />
            <div className="text-xs font-bold text-white">
               Shop Rate: <span className="text-yellow-500">₹{currentRate.price24k.toLocaleString()}/g</span>
            </div>
         </div>
         <div className="text-[10px] font-medium text-indigo-300">
            Last Rate Sync: {new Date(currentRate.timestamp).toLocaleTimeString()}
         </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Nav */}
        <aside className="lg:w-64 space-y-2">
          <button 
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSubTab === 'OVERVIEW' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" /> Dashboard
          </button>
          <button 
            onClick={() => setActiveSubTab('INVENTORY')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSubTab === 'INVENTORY' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Package className="w-5 h-5" /> Inventory
          </button>
          <button 
            onClick={() => setActiveSubTab('HOLDS')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSubTab === 'HOLDS' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Clock className="w-5 h-5" /> Active Holds
          </button>
          <button 
            onClick={() => setActiveSubTab('LOGS')}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeSubTab === 'LOGS' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <History className="w-5 h-5" /> Audit Logs
          </button>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {activeSubTab === 'OVERVIEW' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                    <TrendingUp className="absolute top-4 right-4 w-12 h-12 text-emerald-500/10" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Vault Value</p>
                    <p className="text-3xl font-black text-white">₹{(totalInventoryValue / 100000).toFixed(2)}<span className="text-sm font-medium ml-1">Lakhs</span></p>
                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-500">
                       <ArrowUpRight className="w-3 h-3" /> +1.2% Gain Today
                    </div>
                 </div>
                 <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                    <Users className="absolute top-4 right-4 w-12 h-12 text-indigo-500/10" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Current Reservations</p>
                    <p className="text-3xl font-black text-white">{bookings.filter(b => b.status === 'ACTIVE').length}</p>
                    <p className="mt-4 text-[10px] text-slate-500 font-medium">Pending store visits today</p>
                 </div>
                 <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                    <ShieldAlert className="absolute top-4 right-4 w-12 h-12 text-rose-500/10" />
                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Market Override</p>
                    <div className="flex gap-2 mt-2">
                       <input 
                          type="number" 
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
                       />
                       <button 
                          onClick={handleUpdateRate}
                          className="bg-yellow-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase"
                       >Apply</button>
                    </div>
                 </div>
              </div>

              <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 p-8">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                   <ClipboardList className="w-5 h-5 text-indigo-500" />
                   Live Inventory Feed
                </h3>
                <div className="space-y-4">
                  {inventory.slice(0, 4).map(item => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-bold text-white">{item.name}</p>
                          <p className="text-[9px] text-slate-500">{item.sku}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-yellow-500">{item.stock} in stock</p>
                        <p className="text-[9px] text-slate-500">{item.weight}g • {item.purity}K</p>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => setActiveSubTab('INVENTORY')} className="w-full py-4 text-xs font-bold text-slate-400 hover:text-white transition-colors">View All Inventory</button>
                </div>
              </div>
            </>
          )}

          {activeSubTab === 'INVENTORY' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search by SKU or Name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1a1a1a] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <button 
                  onClick={() => setShowAddForm(true)}
                  className="bg-white text-black font-black px-8 py-4 rounded-2xl hover:bg-yellow-500 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" /> New SKU
                </button>
              </div>

              <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase">
                        <th className="p-6">Jewelry / SKU</th>
                        <th className="p-6">Specs</th>
                        <th className="p-6">Pricing</th>
                        <th className="p-6">Stock Status</th>
                        <th className="p-6">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredInventory.map(item => {
                        const purityMultiplier = item.purity === 24 ? 1 : item.purity === 22 ? 0.916 : 0.75;
                        const retail = (currentRate.price24k * purityMultiplier * item.weight + item.makingCharges) * 1.03;
                        return (
                          <tr key={item.id} className={`group transition-colors ${!item.isVisible ? 'opacity-40 grayscale' : 'hover:bg-white/5'}`}>
                            <td className="p-6">
                              <div className="flex items-center gap-4">
                                <img src={item.image} className="w-12 h-12 rounded-xl object-cover" />
                                <div>
                                  <p className="text-sm font-bold text-white">{item.name}</p>
                                  <p className="text-[10px] text-indigo-400 font-black tracking-widest">{item.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <p className="text-sm font-bold text-yellow-500">{item.purity}K Gold</p>
                              <p className="text-[10px] text-slate-500 font-medium">{item.weight}g Weight</p>
                            </td>
                            <td className="p-6">
                              <p className="text-sm font-bold text-white">₹{retail.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-500 font-medium">M.C: ₹{item.makingCharges}</p>
                            </td>
                            <td className="p-6">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.stock < 5 ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {item.stock} in stock
                              </span>
                            </td>
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <button onClick={() => toggleVisibility(item.id)} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors">
                                  {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button onClick={() => setInventory(prev => prev.filter(i => i.id !== item.id))} className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 transition-colors">
                                  <Trash2 className="w-4 h-4" />
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

          {activeSubTab === 'HOLDS' && (
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase">
                        <th className="p-6">Customer / Design</th>
                        <th className="p-6">Collateral</th>
                        <th className="p-6">Expiry</th>
                        <th className="p-6">Status</th>
                        <th className="p-6">Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {bookings.map(b => (
                        <tr key={b.id} className="group hover:bg-white/5 transition-colors">
                          <td className="p-6">
                            <div>
                               <p className="text-sm font-bold text-white">{b.userName}</p>
                               <p className="text-[10px] text-slate-500">{b.userPhone || 'No Phone'}</p>
                               <div className="mt-1 inline-block px-2 py-0.5 bg-yellow-500/10 rounded text-[9px] font-black text-yellow-500 tracking-wider">
                                  {b.itemSku} • {b.itemName}
                               </div>
                            </div>
                          </td>
                          <td className="p-6">
                             <p className="text-xs font-bold text-white">
                                {b.collateralType === 'CASH_ADVANCE' ? `$${b.collateralValue}` : `${b.collateralValue}g locked`}
                             </p>
                             <p className="text-[9px] text-slate-500">Security Hold</p>
                          </td>
                          <td className="p-6">
                             <p className="text-xs font-bold text-rose-500">
                                {new Date(b.expiresAt).toLocaleDateString()}
                             </p>
                             <p className="text-[10px] text-slate-500">{new Date(b.expiresAt).toLocaleTimeString()}</p>
                          </td>
                          <td className="p-6">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                               b.status === 'ACTIVE' ? 'bg-yellow-500/10 text-yellow-500' : 
                               b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 
                               'bg-red-500/10 text-red-500'
                             }`}>
                               {b.status}
                             </span>
                          </td>
                          <td className="p-6">
                            {b.status === 'ACTIVE' && (
                              <div className="flex gap-2">
                                <button 
                                   onClick={() => confirmSale(b.id)}
                                   className="bg-emerald-500 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-emerald-400"
                                >Complete Sale</button>
                                <button 
                                   onClick={() => extendBooking(b.id)}
                                   className="bg-white/5 text-slate-300 border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white/10"
                                >+48h</button>
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

          {activeSubTab === 'LOGS' && (
            <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
               <div className="p-6 border-b border-white/5 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-indigo-400" />
                  <h3 className="text-lg font-bold">Security Audit Ledger</h3>
               </div>
               <div className="p-6 space-y-4">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-start gap-4">
                       <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${log.action === 'RATE_OVERRIDE' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <p className="text-xs font-black text-white">{log.action}</p>
                             <p className="text-[10px] text-slate-500 font-medium">{new Date(log.timestamp).toLocaleString()}</p>
                          </div>
                          <p className="text-xs text-slate-400">{log.details}</p>
                          <p className="text-[9px] text-slate-600 font-bold uppercase mt-2">Admin: {log.adminId}</p>
                       </div>
                    </div>
                  ))}
                  {auditLogs.length === 0 && (
                    <div className="text-center py-12 text-slate-600 font-bold">No events logged yet.</div>
                  )}
               </div>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[2.5rem] border border-white/10 p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black mb-8">Stock Provisioning Terminal</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Product Information</label>
                <input 
                  placeholder="Asset Name (e.g. Victorian Band)" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
                <input 
                  placeholder="Custom SKU (e.g. AUR-V-001)" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs font-mono"
                  value={newItem.sku}
                  onChange={e => setNewItem({...newItem, sku: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Mass (Grams)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    onChange={e => setNewItem({...newItem, weight: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Purity Tier</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    onChange={e => setNewItem({...newItem, purity: parseInt(e.target.value) as Purity})}
                  >
                    <option value="22">22K Hallmark</option>
                    <option value="24">24K Investment</option>
                    <option value="18">18K Boutique</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Making Surcharge (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    onChange={e => setNewItem({...newItem, makingCharges: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Available Units</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    value={newItem.stock}
                    onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              {/* Dynamic Preview */}
              <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl">
                 <p className="text-[10px] text-yellow-500 font-bold uppercase mb-2">Live Price Preview</p>
                 <div className="flex justify-between items-end">
                    <div>
                       <p className="text-2xl font-black text-white">₹{
                         (((currentRate.price24k * (newItem.purity === 24 ? 1 : newItem.purity === 22 ? 0.916 : 0.75) * (newItem.weight || 0)) + (newItem.makingCharges || 0)) * 1.03).toLocaleString(undefined, { maximumFractionDigits: 0 })
                       }</p>
                       <p className="text-[9px] text-slate-500">Includes 3% GST & Making Charges</p>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-bold text-white">{newItem.weight || 0}g</p>
                       <p className="text-[9px] text-slate-500">{newItem.purity}K Tier</p>
                    </div>
                 </div>
              </div>

              <button 
                onClick={handleAddItem}
                className="w-full bg-white text-black font-black py-5 rounded-[2rem] mt-4 shadow-xl shadow-white/5 hover:bg-yellow-500 transition-all"
              >
                Provision & Commit
              </button>
              <button onClick={() => setShowAddForm(false)} className="w-full text-slate-500 font-bold py-2 hover:text-white transition-colors">Abort Terminal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
