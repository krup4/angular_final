function buildCategory(input, existing) {
  const draft = input && typeof input === 'object' ? input : {};
  const monthlyLimit = Number(draft.monthlyLimit);

  if (!Number.isFinite(monthlyLimit) || monthlyLimit < 0) {
    throwBadRequest('Лимит категории должен быть неотрицательным числом');
  }

  return {
    ...existing,
    monthlyLimit: Math.round(monthlyLimit * 100) / 100,
  };
}

function isBadRequest(error) {
  return Boolean(error?.isBadRequest);
}

function throwBadRequest(message) {
  const error = new Error(message);
  error.isBadRequest = true;
  throw error;
}

module.exports = {
  buildCategory,
  isBadRequest,
};
