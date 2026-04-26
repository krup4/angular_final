import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiButton, TuiLoader, TuiNotification } from '@taiga-ui/core';
import { SubscriptionsStore } from '../../core/api/subscriptions.store';
import {
  BillingPeriod,
  Subscription,
  SubscriptionDraft,
  SubscriptionStatus,
} from '../../shared/models/subscription.models';
import { formatMoney, monthlyCost } from '../../shared/utils/subscription-calculations';

@Component({
  selector: 'app-subscriptions',
  imports: [DatePipe, ReactiveFormsModule, TuiBadge, TuiButton, TuiLoader, TuiNotification],
  templateUrl: './subscriptions.html',
  styleUrl: './subscriptions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Subscriptions implements OnInit {
  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(SubscriptionsStore);
  protected readonly editing = signal<Subscription | null>(null);
  protected readonly submitted = signal(false);
  protected readonly money = formatMoney;
  protected readonly monthlyCost = monthlyCost;

  protected readonly periods: Array<{ value: BillingPeriod; label: string }> = [
    { value: 'monthly', label: 'Ежемесячно' },
    { value: 'quarterly', label: 'Раз в квартал' },
    { value: 'yearly', label: 'Раз в год' },
  ];

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(2)]],
    cost: [999, [Validators.required, Validators.min(1)]],
    billingPeriod: ['monthly' as BillingPeriod, Validators.required],
    nextPaymentDate: [new Date().toISOString().slice(0, 10), Validators.required],
    categoryId: ['', Validators.required],
    status: ['active' as SubscriptionStatus, Validators.required],
    reminderDaysBefore: [3, [Validators.required, Validators.min(0), Validators.max(30)]],
  });

  ngOnInit(): void {
    void this.initialize();
  }

  protected categoryName(categoryId: string): string {
    return this.store.categories().find((category) => category.id === categoryId)?.name ?? 'Без категории';
  }

  protected edit(subscription: Subscription): void {
    this.editing.set(subscription);
    this.submitted.set(false);
    this.form.setValue({
      title: subscription.title,
      cost: subscription.cost,
      billingPeriod: subscription.billingPeriod,
      nextPaymentDate: subscription.nextPaymentDate,
      categoryId: subscription.categoryId,
      status: subscription.status,
      reminderDaysBefore: subscription.reminderDaysBefore,
    });
  }

  protected cancelEdit(): void {
    this.editing.set(null);
    this.submitted.set(false);
    this.form.reset({
      title: '',
      cost: 999,
      billingPeriod: 'monthly',
      nextPaymentDate: new Date().toISOString().slice(0, 10),
      categoryId: this.store.categories()[0]?.id ?? '',
      status: 'active',
      reminderDaysBefore: 3,
    });
  }

  protected async save(): Promise<void> {
    this.submitted.set(true);

    if (this.form.invalid || this.store.saving()) {
      this.form.markAllAsTouched();

      return;
    }

    const draft = this.form.getRawValue() as SubscriptionDraft;
    const current = this.editing();
    const saved = current
      ? await this.store.update({ ...current, ...draft })
      : await this.store.create(draft);

    if (saved && current) {
      this.editing.set(null);
    }

    if (saved) {
      this.submitted.set(false);
      this.cancelEdit();
    }
  }

  protected async toggleStatus(subscription: Subscription): Promise<void> {
    await this.store.update({
      ...subscription,
      status: subscription.status === 'active' ? 'inactive' : 'active',
    });
  }

  protected async remove(subscription: Subscription): Promise<void> {
    await this.store.remove(subscription.id);
  }

  private async initialize(): Promise<void> {
    await this.store.load();

    if (!this.form.controls.categoryId.value) {
      this.form.patchValue({ categoryId: this.store.categories()[0]?.id ?? '' });
    }
  }
}
