export interface Fixed {
  id: string;
  date: string;
  homeTeam: string;
  awayTeam: string;
  market: string;
  confidence: number;
  shortAnalysis: string;
  fullAnalysis: string;
  isVIP: boolean;
  status: 'pending' | 'win' | 'lose';
  result?: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  isVIP: boolean;
  subscriptionEnd?: string;
  affiliateCode: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: 'mobile_money' | 'crypto';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  details: any;
}

export interface Subscription {
  type: '1month' | '3months' | '1year';
  price: number;
  duration: string;
}

export type PronoResult = 'won' | 'lost' | 'pending';
export type PronoStatus = 'draft' | 'published';

export interface Prono {
  id: string;
  title: string;
  sport: string;
  competition: string;
  matchTime: string;
  tip: string;
  odd: number;
  confidence: number;
  content: string;
  result: PronoResult;
  status: PronoStatus;
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalCommissions: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  name: string;
  role: string;
  balanceCommission: number;
  referralCode: string;
  createdAt: string;
}

export interface AdminSubscription {
  id: string;
  userId: string;
  plan: string;
  reference: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface AdminTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerId?: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}
