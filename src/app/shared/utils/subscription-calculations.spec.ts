import { Category, Subscription } from '../models/subscription.models';
import {
  buildCategoryTotals,
  daysUntil,
  filterSubscriptions,
  formatMoney,
  isPaymentSoon,
  monthlyCost,
} from './subscription-calculations';

const subscriptions: Subscription[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Spotify',
    cost: 600,
    currency: 'RUB',
    billingPeriod: 'monthly',
    nextPaymentDate: '2026-05-01',
    categoryId: 'music',
    status: 'active',
    reminderDaysBefore: 7,
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Cloud',
    cost: 1200,
    currency: 'RUB',
    billingPeriod: 'yearly',
    nextPaymentDate: '2026-05-15',
    categoryId: 'tools',
    status: 'active',
    reminderDaysBefore: 3,
  },
  {
    id: '3',
    userId: 'user-1',
    title: 'Old Video',
    cost: 900,
    currency: 'RUB',
    billingPeriod: 'monthly',
    nextPaymentDate: '2026-05-05',
    categoryId: 'music',
    status: 'inactive',
    reminderDaysBefore: 3,
  },
];

const categories: Category[] = [
  { id: 'music', userId: 'user-1', name: 'Музыка', color: '#27725c', monthlyLimit: 500 },
  { id: 'tools', userId: 'user-1', name: 'Инструменты', color: '#5b6fb3', monthlyLimit: 400 },
];

describe('subscription calculations', () => {
  it('returns full monthly cost for monthly active subscriptions', () => {
    expect(monthlyCost(subscriptions[0])).toBe(600);
  });

  it('normalizes yearly payments to monthly cost', () => {
    expect(monthlyCost(subscriptions[1])).toBe(100);
  });

  it('ignores inactive subscriptions in monthly cost', () => {
    expect(monthlyCost(subscriptions[2])).toBe(0);
  });

  it('filters subscriptions by search query', () => {
    expect(filterSubscriptions(subscriptions, baseFilters({ query: 'spot' }))).toHaveLength(1);
  });

  it('filters subscriptions by category', () => {
    expect(filterSubscriptions(subscriptions, baseFilters({ categoryId: 'tools' }))[0].title).toBe(
      'Cloud',
    );
  });

  it('filters subscriptions by status', () => {
    expect(filterSubscriptions(subscriptions, baseFilters({ status: 'inactive' }))[0].title).toBe(
      'Old Video',
    );
  });

  it('sorts subscriptions by cost descending', () => {
    expect(filterSubscriptions(subscriptions, baseFilters({ sort: 'costDesc' }))[0].title).toBe(
      'Spotify',
    );
  });

  it('sorts subscriptions by title', () => {
    expect(filterSubscriptions(subscriptions, baseFilters({ sort: 'titleAsc' }))[0].title).toBe(
      'Cloud',
    );
  });

  it('detects upcoming payment inside reminder window', () => {
    expect(isPaymentSoon(subscriptions[0], new Date('2026-04-25'))).toBe(true);
  });

  it('does not notify outside reminder window', () => {
    expect(isPaymentSoon(subscriptions[1], new Date('2026-04-25'))).toBe(false);
  });

  it('calculates days until payment', () => {
    expect(daysUntil('2026-05-01', new Date('2026-04-25'))).toBe(6);
  });

  it('builds category totals and over-limit marker', () => {
    const totals = buildCategoryTotals(subscriptions, categories);

    expect(totals[0].total).toBe(600);
    expect(totals[0].isOverLimit).toBe(true);
  });

  it('formats money in rubles', () => {
    expect(formatMoney(1200)).toContain('1 200');
  });
});

function baseFilters(overrides = {}) {
  return {
    query: '',
    categoryId: '',
    status: 'all' as const,
    sort: 'nextPaymentAsc' as const,
    ...overrides,
  };
}
