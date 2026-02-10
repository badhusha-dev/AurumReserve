import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { GoldRate, JewelryItem, Purity, Booking, AuditLog, User, MakingChargeType } from '../types';
import { 
  Plus, Trash2, TrendingUp, Package, RefreshCw, 
  Eye, EyeOff, Clock, Search, Filter, 
  ArrowUpRight, Users, ClipboardList, ShieldAlert, History, 
  LayoutDashboard, LogOut, QrCode, UserSearch, Timer, Edit3, X, Zap, 
  ShieldCheck, ArrowDownLeft, DollarSign, Image as ImageIcon, CheckCircle2,
  Calendar, Layers, Percent, MapPin, Calculator, Info, Loader2, SearchIcon,
  Scale, Upload, Scissors, AlertCircle, Radio, ChevronDown, BookmarkCheck,
  Banknote, CalendarClock
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
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  onLogout: () => void;
}

// Helper to create the cropped image from pixels
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) return '';

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL('image/jpeg');
}

const AdminPanel: React.FC<Props> = ({ 
  currentRate, setCurrentRate, globalRate, useOverrideRate, setUseOverrideRate,
  inventory, setInventory, bookings, setBookings, auditLogs, addAuditLog, stats, users, setUsers, onLogout
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'INVENTORY' | 'RESERVATIONS' | 'USERS' | 'AUDIT'>('DASHBOARD');
  const [newRate, setNewRate] = useState(currentRate.price24k.toString());
  const [showForm, setShowForm] = useState<'ADD' | 'EDIT' | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [reservationSearch, setReservationSearch] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  // Enhanced filter state to support URGENT visit preparation
  const [reservationStatusFilter, setReservationStatusFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'URGENT'>('ALL');
  const [qrModalBookingId, setQrModalBookingId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<JewelryItem | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Image Cropping States
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync newRate input with live rate when in Auto-Rate mode
  useEffect(() => {
    if (!useOverrideRate) {
      setNewRate(globalRate.toFixed(2));
    }
  }, [globalRate, useOverrideRate]);

  const [formData, setFormData] = useState<Partial<JewelryItem>>({
    name: '',
    sku: '',
    weight: 0,
    purity: 22,
    makingCharges: 0,
    makingChargeType: 'FIXED',
    category: 'RING',
    stock: 10,
    isVisible: true,
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400'
  });

  const calculateLivePrice = (weight: number, purity: Purity, charge: number, chargeType: MakingChargeType) => {
    const purityMultiplier = purity === 24 ? 1 : purity === 22 ? 0.916 : 0.75;
    const baseMetalValue = currentRate.price24k * purityMultiplier * weight;
    const makingCost = chargeType === 'FIXED' ? charge : (baseMetalValue * charge) / 100;
    const subtotal = baseMetalValue + makingCost;
    const gst = subtotal * 0.03;
    return {
      goldValue: baseMetalValue,
      makingCharge: makingCost,
      tax: gst,
      total: subtotal + gst
    };
  };

  const priceSummary = useMemo(() => {
    return calculateLivePrice(
      formData.weight || 0, 
      formData.purity as Purity || 22, 
      formData.makingCharges || 0, 
      formData.makingChargeType || 'FIXED'
    );
  }, [formData, currentRate]);

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
      addAuditLog("RATE_OVERRIDE", `Manual Rate set to ₹${val.toLocaleString()}/g`);
    }
  };

  const handleRevertToAuto = () => {
    setUseOverrideRate(false);
    addAuditLog("RATE_AUTO", `System reverted to Live Market Feed (₹${globalRate.toLocaleString()}/g)`);
  };

  const handleSaveItem = async () => {
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (showForm === 'ADD') {
      const item: JewelryItem = {
        ...formData as JewelryItem,
        id: `j-${Date.now()}`,
        sku: formData.sku || `AUR-${formData.category?.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*1000)}`
      };
      setInventory(prev => [...prev, item]);
      addAuditLog("STOCK_ADD", `Provisioned SKU: ${item.sku}`);
    } else if (showForm === 'EDIT' && editingItem) {
      setInventory(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...formData } as JewelryItem : i));
      addAuditLog("STOCK_EDIT", `Modified SKU: ${editingItem.sku}`);
    }
    
    setIsUploading(false);
    setShowForm(null);
    setEditingItem(null);
    alert("Asset successfully committed to the digital vault.");
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, status: u.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE' } : u
    ));
    addAuditLog("USER_STATUS_CHANGE", `Updated account state for User ID: ${id}`);
  };

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - currentTime.getTime();
    if (diff <= 0) return "EXPIRED";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [inventory, searchTerm]);

  const openEdit = (item: JewelryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setShowForm('EDIT');
  };

  const toggleVisibility = (id: string) => {
    setInventory(prev => prev.map(item => 
      item.id === id ? { ...item, isVisible: !item.isVisible } : item
    ));
    addAuditLog("STOCK_VISIBILITY", `Toggled visibility for item ID: ${id}`);
  };

  const extendBooking = (id: string) => {
    setBookings(prev => prev.map(b => {
      if (b.id === id) {
        const currentExpiry = new Date(b.expiresAt);
        const newExpiry = new Date(currentExpiry.getTime() + 24 * 60 * 60 * 1000);
        return { ...b, expiresAt: newExpiry.toISOString() };
      }
      return b;
    }));
    addAuditLog("RESERVATION_EXTENDED", `Extended window for Hold: ${id} by 24h`);
  };

  // Image Upload Handlers
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageToCrop(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (imageToCrop && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        setFormData(prev => ({ ...prev, image: croppedImage }));
        setImageToCrop(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [imageToCrop, croppedAreaPixels]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-in fade-in duration-500">
      {/* Professional Sidebar Navigation */}
      <aside className="lg:w-72 space-y-2 shrink-0">
        <div className="bg-[#1a1a1a] rounded-[2rem] border border-white/5 p-4 mb-4">
           <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Terminal Console</h2>
           <div className="space-y-1">
             <button 
               onClick={() => setActiveTab('DASHBOARD')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'DASHBOARD' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <LayoutDashboard className="w-5 h-5" /> Global Dashboard
             </button>
             <button 
               onClick={() => setActiveTab('INVENTORY')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'INVENTORY' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <Package className="w-5 h-5" /> Stock Inventory
             </button>
             <button 
               onClick={() => setActiveTab('RESERVATIONS')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'RESERVATIONS' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <Calendar className="w-5 h-5" /> Reservation Manager
             </button>
             <button 
               onClick={() => setActiveTab('USERS')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'USERS' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <Users className="w-5 h-5" /> User Portfolio
             </button>
             <button 
               onClick={() => setActiveTab('AUDIT')}
               className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'AUDIT' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
             >
               <History className="w-5 h-5" /> Audit Logs
             </button>
           </div>
        </div>
        <div className="p-4 border-t border-white/5">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all"
           >
             <LogOut className="w-5 h-5" /> Secure Exit
           </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-8">
        
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-8">
            {/* Override Rate Banner */}
            {useOverrideRate && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center justify-between animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-rose-500 uppercase tracking-wider">Manual Rate Active</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">The system is decoupled from Live Market feeds.</p>
                  </div>
                </div>
                <button 
                  onClick={handleRevertToAuto}
                  className="bg-rose-500 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-600 transition-all"
                >
                  Enable Auto-Rate
                </button>
              </div>
            )}

            {/* Central Rate Controller & Market Spot */}
            <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <TrendingUp className="w-32 h-32 text-emerald-500" />
               </div>
               <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shadow-inner transition-colors duration-500 ${useOverrideRate ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                     {useOverrideRate ? <AlertCircle className="w-8 h-8" /> : <Zap className="w-8 h-8" />}
                  </div>
                  <div>
                     <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">
                       {useOverrideRate ? 'Manual Spot Price' : 'Global Market Spot'}
                     </p>
                     <p className="text-2xl font-black text-white">₹{currentRate.price24k.toLocaleString()}<span className="text-xs font-medium ml-1">/g</span></p>
                  </div>
               </div>
               <div className="h-12 w-px bg-white/5 hidden md:block" />
               <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest leading-none">Price Controller</p>
                    <div className="flex bg-white/5 p-1 rounded-xl">
                      <button 
                        onClick={handleRevertToAuto}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 ${!useOverrideRate ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Zap className="w-3 h-3" /> Auto
                      </button>
                      <button 
                        onClick={() => setUseOverrideRate(true)}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all flex items-center gap-1.5 ${useOverrideRate ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Edit3 className="w-3 h-3" /> Manual
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3">
                     <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-500">₹</span>
                        <input 
                           type="number" 
                           value={newRate}
                           onChange={(e) => setNewRate(e.target.value)}
                           className={`w-full border border-white/10 rounded-2xl pl-10 pr-4 py-4 text-xl font-black focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all ${useOverrideRate ? 'bg-rose-500/5 text-rose-500' : 'bg-white/5 text-white'}`}
                        />
                     </div>
                     <button onClick={handleUpdateRate} className="bg-yellow-500 text-black px-8 rounded-2xl font-black text-sm hover:bg-yellow-400 transition-all active:scale-95">Set Rate</button>
                  </div>
               </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Total Digital Reserve</p>
                  <p className="text-3xl font-black text-white">{stats.totalGoldLiability.toFixed(2)}<span className="text-sm font-medium ml-1">kg</span></p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-indigo-400">
                     <ShieldCheck className="w-3 h-3" /> Fully Backed Liability
                  </div>
               </div>
               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Active Hold Alerts</p>
                  <p className="text-3xl font-black text-white">{stats.activeReservations}</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-yellow-500">
                     <Clock className="w-3 h-3" /> Expiry Checks Required
                  </div>
               </div>
               <div className="bg-[#1a1a1a] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-xl">
                  <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Daily Revenue</p>
                  <p className="text-3xl font-black text-white">₹{stats.revenueToday.toLocaleString()}</p>
                  <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-emerald-500">
                     <ArrowUpRight className="w-3 h-3" /> Real-time Settlement
                  </div>
               </div>
            </div>

            {/* Recent Hold Alerts */}
            <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 p-8">
               <h3 className="text-lg font-black mb-6 flex items-center gap-2">
                  <Timer className="w-5 h-5 text-rose-500" />
                  Holds Expiring Today
               </h3>
               <div className="space-y-4">
                  {bookings.filter(b => b.status === 'ACTIVE' && getRemainingTime(b.expiresAt).includes('h')).slice(0, 3).map(b => (
                    <div key={b.id} className="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 flex items-center justify-between">
                       <div>
                          <p className="text-sm font-black text-white">{b.userName}</p>
                          <p className="text-[10px] text-slate-500">{b.itemSku} • Hold ID: {b.id}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-rose-500">{getRemainingTime(b.expiresAt)} Left</p>
                          <p className="text-[10px] text-slate-500 uppercase">Until Auto-Restock</p>
                       </div>
                    </div>
                  ))}
                  {bookings.filter(b => b.status === 'ACTIVE').length === 0 && <p className="text-center py-12 text-slate-600 font-bold">No imminent expirations.</p>}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'INVENTORY' && (
          <div className="space-y-6">
             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                   <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                      type="text" 
                      placeholder="Search Master SKU or Product Name..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-[#1a1a1a] border border-white/5 rounded-3xl pl-14 pr-6 py-5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 shadow-xl"
                   />
                </div>
                <button 
                   onClick={() => { setShowForm('ADD'); setFormData({ name: '', sku: '', weight: 0, purity: 22, makingCharges: 0, makingChargeType: 'FIXED', category: 'RING', stock: 10, isVisible: true, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=400' }); }}
                   className="bg-white text-black font-black px-10 py-5 rounded-3xl flex items-center gap-3 hover:bg-yellow-500 transition-all shadow-xl"
                >
                   <Plus className="w-5 h-5" /> Provision Stock
                </button>
             </div>

             <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                           <th className="p-8">Asset SKU</th>
                           <th className="p-8">Specifications</th>
                           <th className="p-8">Calculated Pricing</th>
                           <th className="p-8">Vault Level</th>
                           <th className="p-8">Operations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredInventory.map(item => {
                           const priceData = calculateLivePrice(item.weight, item.purity, item.makingCharges, item.makingChargeType);
                           return (
                             <tr key={item.id} className={`group transition-all ${!item.isVisible ? 'opacity-30' : 'hover:bg-white/[0.02]'}`}>
                                <td className="p-8">
                                   <div className="flex items-center gap-4">
                                      <img src={item.image} className="w-16 h-16 rounded-2xl object-cover shadow-lg" />
                                      <div>
                                         <p className="text-sm font-black text-white">{item.name}</p>
                                         <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase">{item.sku}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="p-8">
                                   <p className="text-sm font-bold text-yellow-500">{item.purity}K Tier</p>
                                   <p className="text-[10px] text-slate-500 font-medium">{item.weight}g mass</p>
                                </td>
                                <td className="p-8">
                                   <p className="text-sm font-black text-white">₹{priceData.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                                   <p className="text-[9px] text-slate-500 font-bold">Labor: {item.makingChargeType === 'FIXED' ? `₹${item.makingCharges}` : `${item.makingCharges}%`}</p>
                                </td>
                                <td className="p-8">
                                   <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${item.stock > 10 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`} />
                                      <p className="text-xs font-bold text-white">{item.stock} Units</p>
                                   </div>
                                </td>
                                <td className="p-8">
                                   <div className="flex items-center gap-4">
                                      <button onClick={() => openEdit(item)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Edit Catalog Entry">
                                         <Edit3 className="w-5 h-5" />
                                      </button>
                                      <button onClick={() => toggleVisibility(item.id)} className="p-2 text-slate-400 hover:text-white transition-colors" title="Visibility Toggle">
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

        {activeTab === 'RESERVATIONS' && (
          <div className="space-y-6">
             {/* Header Section for Reservations */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1a1a1a] p-6 rounded-[1.5rem] border border-white/5 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Total Reservations</p>
                      <p className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'ACTIVE').length}</p>
                   </div>
                   <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                      <BookmarkCheck className="w-6 h-6" />
                   </div>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-[1.5rem] border border-white/5 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-1">Expiring Today</p>
                      <p className="text-2xl font-black text-rose-500">{bookings.filter(b => b.status === 'ACTIVE' && getRemainingTime(b.expiresAt).includes('h')).length}</p>
                   </div>
                   <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-500">
                      <CalendarClock className="w-6 h-6" />
                   </div>
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-4 items-center bg-[#1a1a1a] p-4 rounded-[1.5rem] border border-white/5 shadow-xl">
                <div className="flex-1 flex items-center gap-4 px-4 border-r border-white/5">
                   <UserSearch className="w-5 h-5 text-slate-500" />
                   <input 
                      placeholder="Search Customer Profile or Hold ID..." 
                      className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                      value={reservationSearch}
                      onChange={(e) => setReservationSearch(e.target.value)}
                   />
                </div>
                {/* Enhanced Reservation Manager Filters */}
                <div className="flex gap-2 p-1 bg-white/5 rounded-xl overflow-x-auto">
                   {[
                     { label: 'ALL', value: 'ALL' },
                     { label: 'DUE TODAY', value: 'URGENT' }, // New preparation filter
                     { label: 'RESERVED', value: 'ACTIVE' },
                     { label: 'COMPLETED', value: 'COMPLETED' },
                     { label: 'EXPIRED', value: 'EXPIRED' }
                   ].map(f => (
                     <button 
                        key={f.value}
                        onClick={() => setReservationStatusFilter(f.value as any)}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${reservationStatusFilter === f.value ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'text-slate-500 hover:text-white'}`}
                     >
                       {f.value === 'URGENT' && <CalendarClock className="w-3.5 h-3.5" />}
                       {f.label}
                       {f.value === 'ACTIVE' && bookings.filter(b => b.status === 'ACTIVE').length > 0 && (
                         <span className={`px-1.5 py-0.5 rounded-md text-[8px] ${reservationStatusFilter === 'ACTIVE' ? 'bg-black/20' : 'bg-white/10'}`}>
                           {bookings.filter(b => b.status === 'ACTIVE').length}
                         </span>
                       )}
                       {f.value === 'URGENT' && bookings.filter(b => b.status === 'ACTIVE' && getRemainingTime(b.expiresAt).includes('h')).length > 0 && (
                         <span className="px-1.5 py-0.5 rounded-md text-[8px] bg-rose-500 text-white">
                           {bookings.filter(b => b.status === 'ACTIVE' && getRemainingTime(b.expiresAt).includes('h')).length}
                         </span>
                       )}
                     </button>
                   ))}
                </div>
             </div>

             <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                           <th className="p-8">Visitor Identity</th>
                           <th className="p-8">Asset & Collateral</th>
                           <th className="p-8">Hold Duration</th>
                           <th className="p-8">Workflow Status</th>
                           <th className="p-8">Operational Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {bookings.filter(b => {
                            const matchesSearch = b.userName.toLowerCase().includes(reservationSearch.toLowerCase()) || b.id.includes(reservationSearch);
                            let matchesStatus = reservationStatusFilter === 'ALL' || b.status === reservationStatusFilter;
                            
                            // Specific logic for 'URGENT' (Expiring Today)
                            if (reservationStatusFilter === 'URGENT') {
                              matchesStatus = b.status === 'ACTIVE' && getRemainingTime(b.expiresAt).includes('h');
                            }
                            
                            return matchesSearch && matchesStatus;
                        }).map(b => (
                          <tr key={b.id} className="hover:bg-white/[0.02] transition-colors group">
                             <td className="p-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 font-black text-sm">{b.userName.substring(0,1)}</div>
                                   <div>
                                      <p className="text-sm font-black text-white">{b.userName}</p>
                                      <p className="text-[10px] text-slate-500">{b.userPhone || 'Walk-in Registry'}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <p className="text-[10px] text-indigo-400 font-black tracking-widest uppercase mb-1">{b.itemSku}</p>
                                <p className="text-sm font-bold text-white mb-2">{b.itemName}</p>
                                <p className="text-[10px] text-slate-500 font-medium">
                                   {b.collateralType === 'CASH_ADVANCE' ? `Security: $${b.collateralValue}` : `Security: ${b.collateralValue}g locked`}
                                </p>
                             </td>
                             <td className="p-8">
                                <div className="space-y-1">
                                   <p className={`text-sm font-black flex items-center gap-1.5 ${b.status === 'ACTIVE' ? (getRemainingTime(b.expiresAt).includes('h') ? 'text-rose-500' : 'text-yellow-500') : 'text-slate-500'}`}>
                                      {b.status === 'ACTIVE' ? <Timer className="w-3.5 h-3.5" /> : null}
                                      {getRemainingTime(b.expiresAt)}
                                   </p>
                                   <p className="text-[10px] text-slate-500 font-medium">Expires {new Date(b.expiresAt).toLocaleDateString()}</p>
                                </div>
                             </td>
                             <td className="p-8">
                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.1em] border uppercase ${
                                  b.status === 'ACTIVE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.05)]' : 
                                  b.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                  'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                }`}>
                                  {b.status === 'ACTIVE' ? '4-Day Hold' : b.status}
                                </span>
                             </td>
                             <td className="p-8">
                                {b.status === 'ACTIVE' && (
                                   <div className="flex gap-3">
                                      <button 
                                        onClick={() => setQrModalBookingId(b.id)} 
                                        className="bg-white text-black px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-yellow-500 hover:scale-[1.05] active:scale-95 transition-all shadow-xl"
                                        title="Prepare for Handover"
                                      >
                                         <QrCode className="w-4 h-4" /> Verify Visit
                                      </button>
                                      <button 
                                        onClick={() => extendBooking(b.id)} 
                                        className="bg-white/5 text-slate-400 border border-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:text-white transition-all"
                                        title="Extend hold period by 24h"
                                      >Extend</button>
                                   </div>
                                )}
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
             
             {/* Admin Preparation Tip */}
             <div className="bg-indigo-600/5 border border-indigo-600/10 p-6 rounded-[2rem] flex items-start gap-4">
                <Info className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                <div>
                   <h4 className="text-sm font-black text-white mb-1 uppercase tracking-widest">Store Visit Protocol</h4>
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Admins should filter for <strong>'DUE TODAY'</strong> to identify imminent visits. These items must be polished and ready in the high-security display vault for authenticated handover.
                   </p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'USERS' && (
          <div className="space-y-6">
             <div className="flex items-center gap-4 bg-[#1a1a1a] p-4 rounded-[1.5rem] border border-white/5 shadow-xl">
                <UserSearch className="w-5 h-5 text-slate-500" />
                <input 
                   placeholder="Search Master Phone or Email Registry..." 
                   className="flex-1 bg-transparent text-sm font-bold focus:outline-none"
                   value={userSearchTerm}
                   onChange={(e) => setUserSearchTerm(e.target.value)}
                />
             </div>

             <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                   <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                           <th className="p-8">Member Identity</th>
                           <th className="p-8">Digital Gold Ledger</th>
                           <th className="p-8">Currency Tier</th>
                           <th className="p-8">Status</th>
                           <th className="p-8">Security</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {users.filter(u => u.name.toLowerCase().includes(userSearchTerm.toLowerCase()) || u.email.includes(userSearchTerm)).map(u => (
                          <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                             <td className="p-8">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center text-indigo-400 font-black text-xl">{u.name.substring(0,1)}</div>
                                   <div>
                                      <p className="text-sm font-black text-white">{u.name}</p>
                                      <p className="text-[10px] text-slate-500">{u.email}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="p-8">
                                <p className="text-sm font-black text-white">{u.goldBalance.toFixed(3)} <span className="text-[10px] text-slate-500 font-medium">gms</span></p>
                                <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-tighter">Asset Value: ₹{(u.goldBalance * currentRate.price24k).toLocaleString()}</p>
                             </td>
                             <td className="p-8">
                                <span className="px-3 py-1 bg-white/5 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-widest border border-white/10">INR PREFERRED</span>
                             </td>
                             <td className="p-8">
                                <span className="flex items-center gap-2">
                                   <span className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500'}`} />
                                   <p className="text-[10px] font-black text-white">{u.status}</p>
                                </span>
                             </td>
                             <td className="p-8">
                                <button onClick={() => toggleUserStatus(u.id)} className={`p-2 rounded-xl transition-all ${u.status === 'ACTIVE' ? 'text-slate-500 hover:text-rose-500 hover:bg-rose-500/5' : 'text-emerald-500 bg-emerald-500/10'}`}>
                                   <ShieldAlert className="w-5 h-5" />
                                </button>
                             </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'AUDIT' && (
          <div className="bg-[#1a1a1a] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
             <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 text-rose-500">
                   <ShieldAlert className="w-6 h-6" />
                   Internal Audit History
                </h3>
             </div>
             <div className="p-8 space-y-4 max-h-[600px] overflow-y-auto">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-start gap-6 hover:bg-white/[0.05] transition-all">
                     <div className={`mt-2 w-3 h-3 rounded-full shrink-0 shadow-lg ${log.action.includes('RATE') ? 'bg-rose-500' : 'bg-indigo-500'}`} />
                     <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                           <p className="text-xs font-black text-white tracking-widest">{log.action}</p>
                           <p className="text-[10px] text-slate-500 font-bold">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <p className="text-sm text-slate-400 font-medium leading-relaxed">{log.details}</p>
                        <p className="text-[9px] text-slate-600 font-black uppercase mt-3">Operator: {log.adminId}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {qrModalBookingId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[3rem] border border-white/10 p-12 shadow-2xl text-center relative">
             <button onClick={() => setQrModalBookingId(null)} className="absolute top-8 right-8 text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
             <div className="w-24 h-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center text-emerald-500 mx-auto mb-8 shadow-inner">
                <QrCode className="w-12 h-12" />
             </div>
             <h3 className="text-3xl font-black mb-4">Security Cleared</h3>
             <p className="text-slate-400 mb-10 leading-relaxed">Identity and rate-lock authenticated. Confirm the physical handover of the asset to update the user wallet.</p>
             <div className="bg-white/5 p-8 rounded-[2rem] mb-10 border border-white/5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Authenticated Ticket ID</p>
                <p className="text-2xl font-black text-white tracking-[0.2em]">{qrModalBookingId}</p>
             </div>
             <div className="space-y-4">
               <button 
                 onClick={() => {
                   setBookings(prev => prev.map(b => b.id === qrModalBookingId ? { ...b, status: 'COMPLETED' as const } : b));
                   addAuditLog("SALE_FINALIZED", `Store visit sale completed for Hold: ${qrModalBookingId}`);
                   setQrModalBookingId(null);
                 }}
                 className="w-full bg-emerald-500 text-black font-black py-6 rounded-3xl text-xl shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
               >Complete Asset Handover</button>
               <button onClick={() => setQrModalBookingId(null)} className="w-full text-slate-500 font-black text-sm uppercase py-3">Abort Session</button>
             </div>
          </div>
        </div>
      )}

      {/* PROVISIONING MODAL: DUAL PANE ADD/EDIT */}
      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] w-full max-w-6xl rounded-[3rem] border border-white/10 p-10 shadow-2xl overflow-y-auto max-h-[95vh] relative flex flex-col lg:flex-row gap-10">
            
            {/* Left Pane: The Form */}
            <div className="flex-[1.4] space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-black flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-2xl text-yellow-500"><Package className="w-6 h-6" /></div>
                  {showForm === 'ADD' ? 'Stock Provisioning' : 'Modify Asset Catalog'}
                </h3>
                <button onClick={() => setShowForm(null)} className="lg:hidden text-slate-500"><X /></button>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Product Name</label>
                    <input 
                      placeholder="e.g. Imperial Heritage Ring" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold appearance-none cursor-pointer"
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value as any})}
                    >
                      <option value="RING">Ring</option>
                      <option value="NECKLACE">Necklace</option>
                      <option value="COIN">Coin</option>
                      <option value="BRACELET">Bracelet</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Select Gold Purity</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[18, 22, 24].map(p => (
                      <button 
                        key={p}
                        onClick={() => setFormData({...formData, purity: p as Purity})}
                        className={`py-5 text-sm font-black rounded-2xl border-2 transition-all flex items-center justify-center gap-2 ${formData.purity === p ? 'border-yellow-500 bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'border-white/5 bg-white/5 text-slate-400 hover:text-white hover:border-white/10'}`}
                      >
                        {formData.purity === p && <CheckCircle2 className="w-4 h-4" />}
                        {p}K Gold
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Weight (Grams)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-center text-xl"
                      value={formData.weight || ''}
                      onChange={e => setFormData({...formData, weight: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Quantity</label>
                    <input 
                      type="number" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-center"
                      value={formData.stock || ''}
                      onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status</label>
                    <button 
                      onClick={() => setFormData({...formData, isVisible: !formData.isVisible})}
                      className={`w-full py-5 rounded-2xl font-black text-xs uppercase transition-all ${formData.isVisible ? 'bg-emerald-500/10 text-emerald-500 border-2 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-2 border-rose-500/20'}`}
                    >
                      {formData.isVisible ? 'Available' : 'Hidden'}
                    </button>
                  </div>
                </div>

                {/* DYNAMIC MAKING CHARGE SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                      {formData.makingChargeType === 'FIXED' ? 'Artisan Labor (Fixed Amount)' : 'Artisan Labor (Percentage %)'}
                    </label>
                    <div className="flex bg-white/5 p-1 rounded-xl">
                      <button 
                        onClick={() => setFormData({...formData, makingChargeType: 'FIXED'})}
                        className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 ${formData.makingChargeType === 'FIXED' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Banknote className="w-3 h-3" /> Fixed
                      </button>
                      <button 
                        onClick={() => setFormData({...formData, makingChargeType: 'PERCENTAGE'})}
                        className={`px-4 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center gap-2 ${formData.makingChargeType === 'PERCENTAGE' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                      >
                        <Percent className="w-3 h-3" /> Percent
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder={formData.makingChargeType === 'FIXED' ? "e.g. 1500" : "e.g. 12.5"}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-xl transition-all placeholder:text-slate-700"
                      value={formData.makingCharges || ''}
                      onChange={e => setFormData({...formData, makingCharges: parseFloat(e.target.value)})}
                    />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                      {formData.makingChargeType === 'FIXED' ? '₹' : '%'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={handleSaveItem}
                     disabled={isUploading || !formData.name}
                     className="flex-[2] bg-white text-black font-black py-6 rounded-[2rem] text-xl shadow-2xl hover:bg-yellow-500 disabled:bg-slate-700 transition-all flex items-center justify-center gap-3 active:scale-95"
                   >
                     {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : (showForm === 'ADD' ? 'Commit to Vault' : 'Update Catalog')}
                   </button>
                   <button onClick={() => setShowForm(null)} className="flex-1 text-slate-500 font-black text-sm uppercase tracking-widest hover:text-white transition-colors">Discard</button>
                </div>
              </div>
            </div>

            {/* Right Pane: Live Preview Card & Image Cropper */}
            <div className="flex-1 space-y-8 bg-[#161616] p-8 rounded-[3rem] border border-white/5 relative">
               <button onClick={() => setShowForm(null)} className="hidden lg:block absolute top-8 right-8 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
               
               <div className="sticky top-0 space-y-8">
                  <div className="space-y-2 text-center lg:text-left">
                    <p className="text-[10px] text-yellow-500 font-black uppercase tracking-[0.2em]">Digital Showcase</p>
                    <h4 className="text-xl font-black text-white">Asset Visualization</h4>
                  </div>
                  
                  {/* The Mock Product Card as seen on Customer App */}
                  <div className="bg-[#222] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl shadow-black/50 transition-all duration-500 transform hover:scale-[1.02]">
                     <div className="aspect-[4/5] bg-white/5 relative flex items-center justify-center overflow-hidden">
                        {formData.image ? (
                          <img src={formData.image} className="w-full h-full object-cover animate-in fade-in duration-1000" />
                        ) : (
                          <ImageIcon className="w-16 h-16 text-white/5" />
                        )}
                        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 text-[10px] font-black text-yellow-500 uppercase tracking-widest shadow-lg">
                           {formData.purity}K Hallmarked
                        </div>
                     </div>
                     <div className="p-10 space-y-6">
                        <div className="flex justify-between items-start">
                           <div>
                              <h5 className="text-2xl font-black text-white mb-1">{formData.name || 'Imperial Asset'}</h5>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{formData.category} Catalog</p>
                           </div>
                           <div className="flex items-center gap-1.5 text-slate-400 font-bold text-xs bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                              <Scale className="w-3.5 h-3.5" /> {formData.weight || '0'}g
                           </div>
                        </div>

                        <div className="flex flex-col gap-1">
                           <p className="text-4xl font-black text-white tracking-tighter">₹{priceSummary.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                           <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Retail Evaluation Score: 98.4</p>
                        </div>

                        {/* Enhanced Structured Price Math Breakdown */}
                        <div className="bg-black/40 rounded-3xl border border-white/5 p-6 space-y-4 shadow-inner">
                           <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                              <Calculator className="w-4 h-4 text-yellow-500" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Financial Breakdown</span>
                           </div>
                           
                           <div className="space-y-3">
                              <div className="flex justify-between items-center group/item">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Pure Metal Value</span>
                                    <span className="text-[11px] font-bold text-white/90">Market Rate x {formData.weight}g</span>
                                 </div>
                                 <span className="text-sm font-black text-white">₹{priceSummary.goldValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              </div>
                              
                              <div className="flex justify-between items-center group/item">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Artisan/Labor Charge</span>
                                    <span className="text-[11px] font-bold text-white/90">{formData.makingChargeType === 'FIXED' ? 'Flat Fee' : `${formData.makingCharges}% Markup`}</span>
                                 </div>
                                 <span className="text-sm font-black text-white">₹{priceSummary.makingCharge.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              </div>
                              
                              <div className="flex justify-between items-center group/item">
                                 <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">Statutory GST</span>
                                    <span className="text-[11px] font-bold text-white/90">Govt. Levy (3.0%)</span>
                                 </div>
                                 <span className="text-sm font-black text-emerald-400">₹{priceSummary.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              </div>

                              <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                                 <span className="text-[10px] font-black text-yellow-500 uppercase">Estimated Total</span>
                                 <span className="text-xl font-black text-white">₹{priceSummary.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-14 bg-white text-black font-black flex items-center justify-center rounded-2xl text-[10px] uppercase shadow-xl opacity-20 pointer-events-none">Immediate Pay</div>
                           <div className="h-14 bg-white/5 border border-white/10 text-white font-black flex items-center justify-center rounded-2xl text-[10px] uppercase opacity-20 pointer-events-none">Lock Hold</div>
                        </div>
                     </div>
                  </div>

                  {/* Image Uploader & Cropping Trigger */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-8 border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/5 flex flex-col items-center justify-center text-center gap-4 hover:border-yellow-500/50 transition-all cursor-pointer group"
                  >
                     <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover:text-yellow-500 transition-colors">
                        <Upload className="w-6 h-6" />
                     </div>
                     <div className="space-y-1">
                        <p className="text-xs font-black text-white">Update Asset Creative</p>
                        <p className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">Ensures consistency (4:5 Ratio)</p>
                     </div>
                     <input 
                       ref={fileInputRef}
                       type="file" 
                       accept="image/*" 
                       className="hidden" 
                       onChange={onFileChange} 
                     />
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal Layer */}
      {imageToCrop && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-[#1a1a1a] w-full max-w-2xl rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl relative">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h4 className="text-xl font-black text-white">Asset Framing</h4>
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Adjust to 4:5 Showcase Aspect</p>
              </div>
              <button onClick={() => setImageToCrop(null)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="crop-container">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={4 / 5}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  <span>Zoom Level</span>
                  <span className="text-yellow-500">{(zoom * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-yellow-500"
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={showCroppedImage}
                  className="flex-1 bg-yellow-500 text-black font-black py-5 rounded-2xl text-sm uppercase flex items-center justify-center gap-2 hover:bg-yellow-400 transition-all"
                >
                  <Scissors className="w-4 h-4" /> Finalize Framing
                </button>
                <button 
                  onClick={() => setImageToCrop(null)}
                  className="flex-1 bg-white/5 border border-white/10 text-slate-400 font-bold py-5 rounded-2xl text-sm uppercase"
                >Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;