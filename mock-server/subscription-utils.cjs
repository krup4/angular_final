const BILLING_PERIODS = new Set(['monthly', 'quarterly', 'yearly']);
const STATUSES = new Set(['active', 'inactive']);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function buildSubscription(input, { categories, existing = null, id }) {
  const draft = input && typeof input === 'object' ? input : {};
  const userId = existing?.userId ?? normalizeString(draft.userId);
  const title = normalizeString(draft.title);
  const cost = Number(draft.cost);
  const billingPeriod = normalizeString(draft.billingPeriod);
  const nextPaymentDate = normalizeString(draft.nextPaymentDate);
  const categoryId = normalizeString(draft.categoryId);
  const status = normalizeString(draft.status);
  const reminderDaysBefore = Number(draft.reminderDaysBefore);

  if (!userId) {
    throwBadRequest('Не найден пользователь подписки');
  }

  if (title.length < 2) {
    throwBadRequest('Название подписки должно содержать минимум 2 символа');
  }

  if (!Number.isFinite(cost) || cost < 1) {
    throwBadRequest('Стоимость подписки должна быть положительным числом');
  }

  if (!BILLING_PERIODS.has(billingPeriod)) {
    throwBadRequest('Некорректная периодичность списания');
  }

  if (!DATE_PATTERN.test(nextPaymentDate) || Number.isNaN(Date.parse(nextPaymentDate))) {
    throwBadRequest('Некорректная дата следующего платежа');
  }

  if (!STATUSES.has(status)) {
    throwBadRequest('Некорректный статус подписки');
  }

  if (
    !Number.isInteger(reminderDaysBefore) ||
    reminderDaysBefore < 0 ||
    reminderDaysBefore > 30
  ) {
    throwBadRequest('Напоминание должно быть от 0 до 30 дней');
  }

  const category = categories.find((item) => item.id === categoryId && item.userId === userId);

  if (!category) {
    throwBadRequest('Категория подписки не найдена');
  }

  return {
    id,
    userId,
    title,
    cost: Math.round(cost * 100) / 100,
    currency: 'RUB',
    billingPeriod,
    nextPaymentDate,
    categoryId,
    status,
    reminderDaysBefore,
  };
}

function isBadRequest(error) {
  return Boolean(error?.isBadRequest);
}

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function throwBadRequest(message) {
  const error = new Error(message);
  error.isBadRequest = true;
  throw error;
}

module.exports = {
  buildSubscription,
  isBadRequest,
};
