import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CategoryTotal } from '../../../shared/models/subscription.models';
import { CategoryLimitCardComponent } from './category-limit-card';

const total: CategoryTotal = {
  category: {
    id: 'cat-services',
    userId: 'user-1',
    name: 'Сервисы',
    color: '#27725c',
    monthlyLimit: 2500,
  },
  total: 1800,
  limitUsage: 72,
  isOverLimit: false,
};

describe('CategoryLimitCardComponent', () => {
  let fixture: ComponentFixture<CategoryLimitCardComponent>;
  let component: CategoryLimitCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryLimitCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryLimitCardComponent);
    component = fixture.componentInstance;
    component.total = total;
    fixture.detectChanges();
  });

  it('renders category usage and edit button in view mode', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Сервисы');
    expect(text).toContain('Изменить лимит');
  });

  it('emits edit event with category id', () => {
    const emitSpy = jest.spyOn(component.edit, 'emit');

    getButton('Изменить лимит').click();

    expect(emitSpy).toHaveBeenCalledWith('cat-services');
  });

  it('emits save event with parsed monthly limit in edit mode', () => {
    const emitSpy = jest.spyOn(component.save, 'emit');
    fixture.componentRef.setInput('editing', true);
    fixture.detectChanges();

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.value = '3000';
    input.dispatchEvent(new Event('input'));
    fixture.debugElement.query(By.css('form')).triggerEventHandler('submit', new Event('submit'));
    fixture.detectChanges();

    expect(emitSpy).toHaveBeenCalledWith({ category: total.category, monthlyLimit: 3000 });
  });

  it('emits cancelEdit event in edit mode', () => {
    const emitSpy = jest.spyOn(component.cancelEdit, 'emit');
    fixture.componentRef.setInput('editing', true);
    fixture.detectChanges();

    getButton('Отмена').click();

    expect(emitSpy).toHaveBeenCalled();
  });

  function getButton(name: string): HTMLButtonElement {
    return fixture.debugElement
      .queryAll(By.css('button'))
      .map((element) => element.nativeElement as HTMLButtonElement)
      .find((button) => button.textContent?.trim() === name)!;
  }
});
