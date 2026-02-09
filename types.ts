
export interface GoldRate {
  price24k: number;
  price22k: number;
  timestamp: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  grams: number;
  type: 'BUY' | 'BONUS' | 'REDEEM';
  status: 'COMPLETED' | 'PENDING';
  rate: number;
}

export interface UserStats {
  totalInvested: number;
  totalGrams: number;
  currentValue: number;
  unrealizedGain: number;
  gainPercentage: number;
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
  PROCESSING_FEE_PERCENTAGE = 0.01
}
