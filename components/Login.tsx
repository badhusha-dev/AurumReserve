
import React, { useState } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { ShieldCheck, Phone, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
  const [method, setMethod] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulation
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 1000);
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulating finding a user
    setTimeout(() => {
      const foundUser = MOCK_USERS.find(u => 
        (method === 'EMAIL' && u.email === identifier) || 
        (method === 'PHONE' && u.phone === identifier)
      );

      if (foundUser) {
        onLogin(foundUser);
      } else {
        // Mock default for demo
        onLogin(MOCK_USERS[0]);
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Aesthetic Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-yellow-500 rounded-2xl flex items-center justify-center text-black shadow-lg shadow-yellow-500/20 mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">Aurum<span className="text-yellow-500">Reserve</span></h1>
            <p className="text-slate-400 text-sm">Secure Institutional Grade Gold Savings</p>
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl mb-8">
            <button 
              onClick={() => { setMethod('PHONE'); setStep(1); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${method === 'PHONE' ? 'bg-yellow-500 text-black' : 'text-slate-400'}`}
            >MOBILE OTP</button>
            <button 
              onClick={() => { setMethod('EMAIL'); setStep(1); }}
              className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${method === 'EMAIL' ? 'bg-yellow-500 text-black' : 'text-slate-400'}`}
            >ADMIN LOGIN</button>
          </div>

          {step === 1 ? (
            <form onSubmit={handleInitialSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                  {method === 'PHONE' ? <Phone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                </div>
                <input 
                  type={method === 'PHONE' ? 'tel' : 'email'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={method === 'PHONE' ? "Enter Mobile Number" : "Enter Admin Email"}
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black font-black py-5 rounded-3xl hover:bg-yellow-500 transition-all shadow-xl flex items-center justify-center gap-2 group"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleFinalSubmit} className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={method === 'PHONE' ? "Enter 4-digit OTP" : "Enter Admin Password"}
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-white font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-500 text-black font-black py-5 rounded-3xl hover:bg-yellow-400 transition-all shadow-xl flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Secure Login"}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                className="w-full text-slate-500 font-bold text-xs hover:text-white transition-colors"
              >
                Change {method === 'PHONE' ? 'number' : 'email'}
              </button>
            </form>
          )}

          <div className="mt-10 flex items-center justify-center gap-2 px-6 py-3 bg-white/5 rounded-2xl border border-white/5">
             <ShieldCheck className="w-4 h-4 text-emerald-500" />
             <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">256-Bit Encrypted Connection</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
