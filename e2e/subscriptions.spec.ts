import { expect, test } from '@playwright/test';

test('user can login and see dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page.getByRole('heading', { name: 'Регулярные платежи' })).toBeVisible();
  await expect(page.getByText('Расходы в месяц')).toBeVisible();
});

test('user can create a subscription', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('link', { name: 'Подписки' }).click();

  await page.getByLabel('Название').fill('Test Subscription');
  await page.getByLabel('Стоимость').fill('350');
  await page.getByLabel('Категория').selectOption({ label: 'Сервисы' });
  await page.getByRole('button', { name: 'Добавить' }).click();

  await expect(page.getByRole('heading', { name: 'Test Subscription' })).toBeVisible();
});

test('user can filter subscriptions by search', async ({ page }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Войти' }).click();
  await page.getByRole('link', { name: 'Подписки' }).click();

  await page.getByLabel('Поиск').fill('Spotify');

  await expect(page.getByRole('heading', { name: 'Spotify' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'GitHub Copilot' })).toBeHidden();
});
