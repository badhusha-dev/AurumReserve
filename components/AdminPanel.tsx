
import React, { useState } from 'react';
import { GoldRate, JewelryItem, Purity } from '../types';
import { Settings, Plus, Save, Trash2, TrendingUp, Package, RefreshCw, Eye, EyeOff, BarChart3 } from 'lucide-react';

interface Props {
  currentRate: GoldRate;
  setCurrentRate: React.Dispatch<React.SetStateAction<GoldRate>>;
  inventory: JewelryItem[];
  setInventory: React.Dispatch<React.SetStateAction<JewelryItem[]>>;
}

const AdminPanel: React.FC<Props> = ({ currentRate, setCurrentRate, inventory, setInventory }) => {
  const [newRate, setNewRate] = useState(currentRate.price24k.toString());
  const [showAddForm, setShowAddForm] = useState(false);
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
    }
  };

  const handleAddItem = () => {
    const item: JewelryItem = {
      ...newItem as JewelryItem,
      id: `j-${Date.now()}`,
      sku: newItem.sku || `AUR-${newItem.category?.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`
    };
    setInventory(prev => [...prev, item]);
    setShowAddForm(false);
  };

  const toggleVisibility = (id: string) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
  };

  const totalInventoryValue = inventory.reduce((acc, item) => {
    const purityMultiplier = item.purity === 24 ? 1 : item.purity === 22 ? 0.916 : 0.75;
    const val = (currentRate.price24k * purityMultiplier * item.weight + item.makingCharges) * 1.03;
    return acc + (val * item.stock);
  }, 0);

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white flex items-center gap-3">
            <Settings className="w-8 h-8 text-indigo-500" />
            Stock Master Dashboard
          </h2>
          <p className="text-slate-400">Institutional Catalog & Market Control</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rate Control */}
        <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-400" />
            <h3 className="text-xl font-bold">Global Market Rate</h3>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Live 24K Spot (INR/g)</label>
              <div className="flex gap-4">
                <input 
                  type="number" 
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xl font-black focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button 
                  onClick={handleUpdateRate}
                  className="bg-emerald-500 text-black font-black px-8 rounded-2xl hover:bg-emerald-400 transition-all flex items-center gap-2"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats 1 */}
        <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Store Valuation</h3>
          </div>
          <p className="text-3xl font-black text-white">₹{totalInventoryValue.toLocaleString()}</p>
          <p className="text-xs font-bold text-slate-500 uppercase mt-2">Combined Retail Value</p>
        </div>

        {/* Catalog Stats */}
        <div className="bg-[#1a1a1a] rounded-3xl p-8 border border-white/5 flex flex-col justify-center">
          <div className="flex items-center justify-between gap-4">
            <div>
               <p className="text-3xl font-black text-white">{inventory.length}</p>
               <p className="text-xs font-bold text-indigo-400 uppercase">Live SKUs</p>
            </div>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-white text-black font-black py-4 px-8 rounded-2xl hover:bg-yellow-500 transition-all flex items-center gap-2 shadow-xl shadow-white/5"
            >
              <Plus className="w-5 h-5" /> Add Stock
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
           <h3 className="text-xl font-bold">Vault Inventory</h3>
           <div className="flex gap-2">
             <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold">
               <Package className="w-3 h-3" /> Fully Audited
             </span>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase">
                <th className="p-6">Jewelry / SKU</th>
                <th className="p-6">Specifications</th>
                <th className="p-6">Retail Pricing</th>
                <th className="p-6">Availability</th>
                <th className="p-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.map(item => {
                const purityMultiplier = item.purity === 24 ? 1 : item.purity === 22 ? 0.916 : 0.75;
                const price = (currentRate.price24k * purityMultiplier * item.weight + item.makingCharges) * 1.03;

                return (
                  <tr key={item.id} className={`group transition-colors ${!item.isVisible ? 'opacity-40 grayscale' : 'hover:bg-white/5'}`}>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img src={item.image} className="w-12 h-12 rounded-lg object-cover shadow-lg border border-white/5" />
                        <div>
                          <p className="font-bold text-white">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-black tracking-widest">{item.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-yellow-500">{item.purity}K Purified Gold</p>
                      <p className="text-xs text-slate-500 font-medium">{item.weight}g weight</p>
                    </td>
                    <td className="p-6">
                      <p className="text-sm font-bold text-white">₹{price.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-500">M.C: ₹{item.makingCharges}</p>
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${item.stock < 5 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {item.stock} Units
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => toggleVisibility(item.id)}
                          className={`p-2 rounded-lg transition-colors ${item.isVisible ? 'text-indigo-400 hover:bg-indigo-400/10' : 'text-slate-500 hover:bg-slate-500/10'}`}
                          title={item.isVisible ? "Hide from Store" : "Show in Store"}
                        >
                          {item.isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        </button>
                        <button 
                          onClick={() => setInventory(prev => prev.filter(i => i.id !== item.id))}
                          className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                          title="Delete Permanently"
                        >
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

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[2rem] border border-white/10 p-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-2xl font-black mb-8">Provision New Inventory</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Product Information</label>
                <input 
                  placeholder="Asset Name" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                />
                <input 
                  placeholder="Custom SKU (Optional)" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-xs font-mono"
                  value={newItem.sku}
                  onChange={e => setNewItem({...newItem, sku: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Weight (Grams)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    onChange={e => setNewItem({...newItem, weight: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Purity</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    onChange={e => setNewItem({...newItem, purity: parseInt(e.target.value) as Purity})}
                  >
                    <option value="22">22K Hallmark</option>
                    <option value="24">24K Investment</option>
                    <option value="18">18K Luxury</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Making Charges (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    onChange={e => setNewItem({...newItem, makingCharges: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase ml-2">Initial Stock</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
                    value={newItem.stock}
                    onChange={e => setNewItem({...newItem, stock: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <button 
                onClick={handleAddItem}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-3xl mt-6 shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
              >
                Launch to Catalog
              </button>
              <button onClick={() => setShowAddForm(false)} className="w-full text-slate-500 font-bold py-2 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
