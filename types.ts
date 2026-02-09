
export type CurrencyCode = 'INR' | 'USD' | 'AED';
export type UserRole = 'CUSTOMER' | 'ADMIN';
export type Purity = 18 | 22 | 24;
export type CollateralType = 'CASH_ADVANCE' | 'GOLD_LOCK';

export interface User {
  id: string;
  name: string;
  phone?: string;
  email: string;
  role: UserRole;
  goldBalance: number;
}

export interface GoldRate {
  price24k: number;
  price22k: number;
  timestamp: string;
}

export interface JewelryItem {
  id: string;
  sku: string;
  name: string;
  category: 'RING' | 'NECKLACE' | 'COIN' | 'BRACELET';
  weight: number; 
  purity: Purity;
  makingCharges: number; 
  image: string;
  stock: number;
  isVisible: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  itemId: string;
  itemName: string;
  itemSku: string;
  collateralType: CollateralType;
  collateralValue: number; 
  lockedPrice: number; 
  createdAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
}

export interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface GiftMetadata {
  recipientName: string;
  message: string;
  theme: 'BIRTHDAY' | 'WEDDING' | 'FESTIVAL' | 'GENERAL';
}

export interface Transaction {
  id: string;
  date: string;
  amount: number; 
  grams: number;
  type: 'BUY' | 'BONUS' | 'REDEEM' | 'GIFT_SENT' | 'GIFT_RECEIVED' | 'JEWELRY_PURCHASE' | 'BOOKING_COLLATERAL';
  status: 'COMPLETED' | 'PENDING';
  rate: number;
  currencyAtRuntime: CurrencyCode;
  exchangeRateAtRuntime: number;
  giftMetadata?: GiftMetadata;
  details?: string;
}

export interface UserStats {
  totalInvested: number;
  totalGrams: number;
  currentValue: number;
  unrealizedGain: number;
  gainPercentage: number;
  loyaltyTier: 'SILVER' | 'GOLD' | 'PLATINUM';
  currentStreak: number;
}

export interface SchemeInfo {
  name: string;
  durationMonths: number;
  monthlyInstallment: number;
  monthsPaid: number;
  nextDueDate: string;
  isEligibleForBonus: boolean;
}

export enum CalculationConstants {
  GST_PERCENTAGE = 0.03,
  PROCESSING_FEE_PERCENTAGE = 0.01,
  BOOKING_CASH_ADVANCE = 50, // USD
  BOOKING_DURATION_HOURS = 96 // 4 Days
}
