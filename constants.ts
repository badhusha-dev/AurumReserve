
import { Transaction, CurrencyCode, JewelryItem, User } from './types';

export const INITIAL_GOLD_RATE = {
  price24k: 7250.50,
  price22k: 6645.20,
  timestamp: new Date().toISOString()
};

export const EXCHANGE_RATES: Record<CurrencyCode, number> = {
  INR: 1,
  USD: 0.012, 
  AED: 0.044  
};

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  AED: 'د.إ'
};

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: 'Sarah Gold',
    phone: '9876543210',
    email: 'sarah@example.com',
    role: 'CUSTOMER',
    goldBalance: 5.42,
    status: 'ACTIVE'
  },
  {
    id: 'admin1',
    name: 'Chief Vault Master',
    email: 'admin@aurumreserve.com',
    role: 'ADMIN',
    goldBalance: 0,
    status: 'ACTIVE'
  }
];

export const MOCK_JEWELRY: JewelryItem[] = [
  {
    id: 'j1',
    sku: 'AUR-RING-001',
    name: 'Eternal Rose Gold Ring',
    category: 'RING',
    weight: 4.5,
    purity: 22,
    makingCharges: 1500,
    makingChargeType: 'FIXED',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=400',
    stock: 12,
    isVisible: true
  },
  {
    id: 'j2',
    sku: 'AUR-NECK-002',
    name: 'Royal Heritage Necklace',
    category: 'NECKLACE',
    weight: 24.2,
    purity: 22,
    makingCharges: 12,
    makingChargeType: 'PERCENTAGE',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=400',
    stock: 3,
    isVisible: true
  },
  {
    id: 'j3',
    sku: 'AUR-COIN-003',
    name: 'Standard 24K Investment Coin',
    category: 'COIN',
    weight: 10.0,
    purity: 24,
    makingCharges: 500,
    makingChargeType: 'FIXED',
    image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=400',
    stock: 50,
    isVisible: true
  }
];

export const MOCK_HISTORY = [
  { day: '2024-01-01', price: 6100 },
  { day: '2024-01-15', price: 6250 },
  { day: '2024-02-01', price: 6400 },
  { day: '2024-02-15', price: 6350 },
  { day: '2024-03-01', price: 6800 },
  { day: '2024-03-15', price: 6950 },
  { day: '2024-04-01', price: 7250 },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { 
    id: '1', 
    date: '2024-01-05', 
    amount: 5000, 
    grams: 0.82, 
    type: 'BUY', 
    status: 'COMPLETED', 
    rate: 6100,
    currencyAtRuntime: 'INR',
    exchangeRateAtRuntime: 1
  }
];
