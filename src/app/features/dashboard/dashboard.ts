import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TuiBadge, TuiProgressBar } from '@taiga-ui/kit';
import { TuiLoader, TuiNotification } from '@taiga-ui/core';
import { SubscriptionsStore } from '../../core/api/subscriptions.store';
import { daysUntil, formatMoney } from '../../shared/utils/subscription-calculations';
import { Category } from '../../shared/models/subscription.models';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, TuiBadge, TuiLoader, TuiNotification, TuiProgressBar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  protected readonly store = inject(SubscriptionsStore);
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
}
