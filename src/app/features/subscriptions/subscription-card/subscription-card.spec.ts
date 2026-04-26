import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Subscription } from '../../../shared/models/subscription.models';
import { SubscriptionCardComponent } from './subscription-card';

const subscription: Subscription = {
  id: 'sub-test',
  userId: 'user-1',
  title: 'Test Subscription',
  cost: 1200,
  currency: 'RUB',
  billingPeriod: 'monthly',
  nextPaymentDate: '2026-05-10',
  categoryId: 'cat-services',
  status: 'active',
  reminderDaysBefore: 3,
};

describe('SubscriptionCardComponent', () => {
  let fixture: ComponentFixture<SubscriptionCardComponent>;
  let component: SubscriptionCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubscriptionCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubscriptionCardComponent);
    component = fixture.componentInstance;
    component.subscription = subscription;
    component.categoryName = 'Сервисы';
    fixture.detectChanges();
  });

  it('renders subscription title and category', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Test Subscription');
    expect(text).toContain('Сервисы');
  });

  it('emits edit event with the current subscription', () => {
    const emitSpy = jest.spyOn(component.edit, 'emit');

    getButton('Изменить').click();

    expect(emitSpy).toHaveBeenCalledWith(subscription);
  });

  it('emits toggleStatus event with the current subscription', () => {
    const emitSpy = jest.spyOn(component.toggleStatus, 'emit');

    getButton('Деактивировать').click();

    expect(emitSpy).toHaveBeenCalledWith(subscription);
  });

  it('emits remove event with the current subscription', () => {
    const emitSpy = jest.spyOn(component.remove, 'emit');

    getButton('Удалить').click();

    expect(emitSpy).toHaveBeenCalledWith(subscription);
  });

  function getButton(name: string): HTMLButtonElement {
    return fixture.debugElement
      .queryAll(By.css('button'))
      .map((element) => element.nativeElement as HTMLButtonElement)
      .find((button) => button.textContent?.trim() === name)!;
  }
});
