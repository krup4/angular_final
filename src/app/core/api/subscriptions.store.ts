import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { SubscriptionApiService } from './subscription-api.service';
import {
  Category,
  Subscription,
  SubscriptionDraft,
  SubscriptionFilters,
} from '../../shared/models/subscription.models';
import {
  buildCategoryTotals,
  filterSubscriptions,
  isPaymentSoon,
  monthlyCost,
} from '../../shared/utils/subscription-calculations';

interface SubscriptionsState {
  subscriptions: Subscription[];
  categories: Category[];
  filters: SubscriptionFilters;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: SubscriptionsState = {
  subscriptions: [],
  categories: [],
  filters: {
    query: '',
    categoryId: '',
    status: 'all',
    sort: 'nextPaymentAsc',
  },
  loading: false,
  saving: false,
  error: null,
};

export const SubscriptionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    filteredSubscriptions: computed(() =>
      filterSubscriptions(store.subscriptions(), store.filters()),
    ),
    activeSubscriptions: computed(() =>
      store.subscriptions().filter((subscription) => subscription.status === 'active'),
    ),
    monthlyTotal: computed(() =>
      store.subscriptions().reduce((sum, subscription) => sum + monthlyCost(subscription), 0),
    ),
    upcomingPayments: computed(() =>
      store
        .subscriptions()
        .filter((subscription) => isPaymentSoon(subscription))
        .sort((a, b) => new Date(a.nextPaymentDate).getTime() - new Date(b.nextPaymentDate).getTime()),
    ),
    categoryTotals: computed(() => buildCategoryTotals(store.subscriptions(), store.categories())),
  })),
  withMethods((store, api = inject(SubscriptionApiService), auth = inject(AuthService)) => ({
    updateFilters(filters: Partial<SubscriptionFilters>): void {
      patchState(store, { filters: { ...store.filters(), ...filters } });
    },

    async load(): Promise<void> {
      const user = auth.user();

      if (!user) {
        return;
      }

      patchState(store, { loading: true, error: null });

      try {
        const [subscriptions, categories] = await Promise.all([
          firstValueFrom(api.getSubscriptions(user.id)),
          firstValueFrom(api.getCategories(user.id)),
        ]);

        patchState(store, { subscriptions, categories, loading: false });
      } catch (error) {
        patchState(store, { error: getErrorMessage(error), loading: false });
      }
    },

    async create(draft: SubscriptionDraft): Promise<boolean> {
      const user = auth.user();

      if (!user) {
        return false;
      }

      patchState(store, { saving: true, error: null });

      try {
        const created = await firstValueFrom(api.createSubscription(user.id, draft));

        patchState(store, {
          subscriptions: [...store.subscriptions(), created],
          saving: false,
        });
        return true;
      } catch (error) {
        patchState(store, { error: getErrorMessage(error), saving: false });
        return false;
      }
    },

    async update(subscription: Subscription): Promise<boolean> {
      patchState(store, { saving: true, error: null });

      try {
        const updated = await firstValueFrom(api.updateSubscription(subscription));

        patchState(store, {
          subscriptions: store
            .subscriptions()
            .map((item) => (item.id === updated.id ? updated : item)),
          saving: false,
        });
        return true;
      } catch (error) {
        patchState(store, { error: getErrorMessage(error), saving: false });
        return false;
      }
    },

    async remove(id: string): Promise<void> {
      patchState(store, { saving: true, error: null });

      try {
        await firstValueFrom(api.deleteSubscription(id));
        patchState(store, {
          subscriptions: store.subscriptions().filter((item) => item.id !== id),
          saving: false,
        });
      } catch (error) {
        patchState(store, { error: getErrorMessage(error), saving: false });
      }
    },
  })),
);

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос';
}
