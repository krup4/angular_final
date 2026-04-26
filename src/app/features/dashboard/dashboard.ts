import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiLoader, TuiNotification } from '@taiga-ui/core';
import { SubscriptionsStore } from '../../core/api/subscriptions.store';
import { daysUntil, formatMoney } from '../../shared/utils/subscription-calculations';
import { Category } from '../../shared/models/subscription.models';
import {
  CategoryLimitCardComponent,
  CategoryLimitUpdate,
} from './category-limit-card/category-limit-card';

@Component({
  selector: 'app-dashboard',
  imports: [CategoryLimitCardComponent, DatePipe, TuiBadge, TuiLoader, TuiNotification],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  protected readonly store = inject(SubscriptionsStore);
  protected readonly editingLimitId = signal<string | null>(null);
  protected readonly money = formatMoney;
  protected readonly overLimitCount = () =>
    this.store.categoryTotals().filter((total) => total.isOverLimit).length;

  ngOnInit(): void {
    void this.store.load();
  }

  protected categoryName(categoryId: string): string {
    return (
      this.store.categories().find((category: Category) => category.id === categoryId)?.name ??
      'Без категории'
    );
  }

  protected daysLeft(date: string): number {
    return daysUntil(date);
  }

  protected editLimit(categoryId: string): void {
    this.editingLimitId.set(categoryId);
  }

  protected cancelLimitEdit(): void {
    this.editingLimitId.set(null);
  }

  protected async updateLimit(update: CategoryLimitUpdate): Promise<void> {
    const saved = await this.store.updateCategoryLimit(update.category.id, update.monthlyLimit);

    if (saved) {
      this.editingLimitId.set(null);
    }
  }
}
