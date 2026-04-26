import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { TuiProgressBar } from '@taiga-ui/kit';
import { TuiButton } from '@taiga-ui/core';
import { Category, CategoryTotal } from '../../../shared/models/subscription.models';
import { formatMoney } from '../../../shared/utils/subscription-calculations';

export interface CategoryLimitUpdate {
  category: Category;
  monthlyLimit: number;
}

@Component({
  selector: 'app-category-limit-card',
  imports: [TuiButton, TuiProgressBar],
  templateUrl: './category-limit-card.html',
  styleUrl: './category-limit-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryLimitCardComponent {
  @Input({ required: true }) total!: CategoryTotal;
  @Input() editing = false;
  @Input() saving = false;

  @Output() readonly edit = new EventEmitter<string>();
  @Output() readonly cancelEdit = new EventEmitter<void>();
  @Output() readonly save = new EventEmitter<CategoryLimitUpdate>();

  protected readonly money = formatMoney;

  protected submitLimit(event: SubmitEvent, value: string): void {
    event.preventDefault();
    this.saveLimit(value);
  }

  protected saveLimit(value: string): void {
    const monthlyLimit = Number(value);

    if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
      return;
    }

    this.save.emit({ category: this.total.category, monthlyLimit });
  }
}
