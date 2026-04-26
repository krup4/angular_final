import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/login');
  await page.locator('button[type="submit"]').click();
});

test('user can login and see dashboard', async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Регулярные платежи' })).toBeVisible();
  await expect(page.getByText('Расходы в месяц')).toBeVisible();
});

test('user can create, edit and delete a subscription', async ({ page }) => {
  const title = `Test Subscription ${Date.now()}`;
  const editedTitle = `${title} Edited`;

  await page.getByRole('link', { name: 'Подписки' }).click();

  const form = page.locator('form[aria-label="Форма подписки"]');

  await form.getByRole('textbox', { name: 'Название' }).fill(title);
  await form.getByLabel('Стоимость').fill('350');
  await form.getByLabel('Категория').selectOption({ label: 'Сервисы' });
  await form.getByRole('button', { name: 'Добавить' }).click();

  const createdCard = page.locator('app-subscription-card').filter({ hasText: title });

  await expect(page.getByRole('heading', { name: title })).toBeVisible();

  await createdCard.getByRole('button', { name: 'Изменить' }).click();
  await form.getByRole('textbox', { name: 'Название' }).fill(editedTitle);
  await form.getByRole('button', { name: 'Сохранить' }).click();

  const editedCard = page.locator('app-subscription-card').filter({ hasText: editedTitle });

  await expect(page.getByRole('heading', { name: editedTitle })).toBeVisible();

  await editedCard.getByRole('button', { name: 'Удалить' }).click();
  await expect(page.getByRole('heading', { name: editedTitle })).toBeHidden();
});

test('user can filter subscriptions by search', async ({ page }) => {
  await page.getByRole('link', { name: 'Подписки' }).click();

  await page.getByLabel('Поиск').fill('Cloud');

  await expect(page.getByRole('heading', { name: 'Cloud Storage' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Old Streaming' })).toBeHidden();
});

test('user can update a category limit without page reload', async ({ page }) => {
  await page.getByRole('heading', { name: 'Лимиты категорий' }).scrollIntoViewIfNeeded();

  const servicesLimit = page.locator('app-category-limit-card').filter({ hasText: 'Сервисы' });

  await servicesLimit.getByRole('button', { name: 'Изменить лимит' }).click();
  await expect(servicesLimit.getByLabel('Новый лимит Сервисы')).toBeVisible();

  await servicesLimit.getByLabel('Новый лимит Сервисы').fill('3000');
  await servicesLimit.getByRole('button', { name: 'Сохранить' }).click();

  await expect(servicesLimit).toContainText(/3\s000/);
  await expect(servicesLimit.getByLabel('Новый лимит Сервисы')).toBeHidden();
});
