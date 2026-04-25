import {
  Category,
  CategoryTotal,
  SortMode,
  Subscription,
  SubscriptionFilters,
} from '../models/subscription.models';

const PERIOD_DIVISOR: Record<Subscription['billingPeriod'], number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

export function monthlyCost(subscription: Subscription): number {
  return subscription.status === 'active'
    ? Math.round((subscription.cost / PERIOD_DIVISOR[subscription.billingPeriod]) * 100) / 100
    : 0;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function daysUntil(date: string, now = new Date()): number {
  const start = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date);
  const end = Date.UTC(target.getFullYear(), target.getMonth(), target.getDate());

  return Math.ceil((end - start) / 86_400_000);
}

export function isPaymentSoon(subscription: Subscription, now = new Date()): boolean {
  const days = daysUntil(subscription.nextPaymentDate, now);

  return subscription.status === 'active' && days >= 0 && days <= subscription.reminderDaysBefore;
}

export function filterSubscriptions(
  subscriptions: readonly Subscription[],
  filters: SubscriptionFilters,
): Subscription[] {
  const query = filters.query.trim().toLowerCase();

  return subscriptions
    .filter((subscription) => {
      const matchesQuery = !query || subscription.title.toLowerCase().includes(query);
      const matchesCategory = !filters.categoryId || subscription.categoryId === filters.categoryId;
      const matchesStatus = filters.status === 'all' || subscription.status === filters.status;

      return matchesQuery && matchesCategory && matchesStatus;
    })
    .sort(subscriptionSorter(filters.sort));
}

export function buildCategoryTotals(
  subscriptions: readonly Subscription[],
  categories: readonly Category[],
): CategoryTotal[] {
  return categories.map((category) => {
    const total = subscriptions
      .filter((subscription) => subscription.categoryId === category.id)
      .reduce((sum, subscription) => sum + monthlyCost(subscription), 0);

    const limitUsage = category.monthlyLimit > 0 ? Math.round((total / category.monthlyLimit) * 100) : 0;

    return {
      category,
      total,
      limitUsage,
      isOverLimit: category.monthlyLimit > 0 && total > category.monthlyLimit,
    };
  });
}

function subscriptionSorter(sort: SortMode): (a: Subscription, b: Subscription) => number {
  return (a, b) => {
    if (sort === 'costDesc') {
      return monthlyCost(b) - monthlyCost(a);
    }

    if (sort === 'titleAsc') {
      return a.title.localeCompare(b.title, 'ru');
    }

    return new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime();
  };
}
