import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiButton } from '@taiga-ui/core';
import { Subscription } from '../../../shared/models/subscription.models';
import { formatMoney, monthlyCost } from '../../../shared/utils/subscription-calculations';

@Component({
  selector: 'app-subscription-card',
  imports: [DatePipe, TuiBadge, TuiButton],
  templateUrl: './subscription-card.html',
  styleUrl: './subscription-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionCardComponent {
  @Input({ required: true }) subscription!: Subscription;
  @Input({ required: true }) categoryName = '';

  @Output() readonly edit = new EventEmitter<Subscription>();
  @Output() readonly toggleStatus = new EventEmitter<Subscription>();
  @Output() readonly remove = new EventEmitter<Subscription>();

  protected readonly money = formatMoney;
  protected readonly monthlyCost = monthlyCost;
}
