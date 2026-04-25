export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly';
export type SubscriptionStatus = 'active' | 'inactive';
export type SortMode = 'nextPaymentAsc' | 'costDesc' | 'titleAsc';

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
}

export interface Session {
  token: string;
  user: Omit<User, 'password'>;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  monthlyLimit: number;
}

export interface Subscription {
  id: string;
  userId: string;
  title: string;
  cost: number;
  currency: 'RUB';
  billingPeriod: BillingPeriod;
  nextPaymentDate: string;
  categoryId: string;
  status: SubscriptionStatus;
  reminderDaysBefore: number;
}

export interface SubscriptionDraft {
  title: string;
  cost: number;
  billingPeriod: BillingPeriod;
  nextPaymentDate: string;
  categoryId: string;
  status: SubscriptionStatus;
  reminderDaysBefore: number;
}

export interface SubscriptionFilters {
  query: string;
  categoryId: string;
  status: 'all' | SubscriptionStatus;
  sort: SortMode;
}

export interface CategoryTotal {
  category: Category;
  total: number;
  limitUsage: number;
  isOverLimit: boolean;
}
