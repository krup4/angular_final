const { applyCors, handleOptions, loadDb, readBody, saveDb, sendJson } = require('../../mock-server/vercel-utils.cjs');
const { buildSubscription, isBadRequest } = require('../../mock-server/subscription-utils.cjs');

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { id } = req.query ?? {};
    const subscriptionId = Array.isArray(id) ? id[0] : id;
    const fallbackId = decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) ?? '');
    const targetId = subscriptionId || fallbackId;
    const db = await loadDb();

    if (req.method === 'PUT') {
      const draft = await readBody(req);
      const index = db.subscriptions.findIndex((item) => item.id === targetId);

      if (index === -1) {
        sendJson(res, 404, { message: 'Подписка не найдена' });
        return;
      }

      db.subscriptions[index] = buildSubscription(draft, {
        categories: db.categories,
        existing: db.subscriptions[index],
        id: targetId,
      });
      await saveDb(db);
      sendJson(res, 200, db.subscriptions[index]);
      return;
    }

    if (req.method === 'DELETE') {
      db.subscriptions = db.subscriptions.filter((item) => item.id !== targetId);
      await saveDb(db);
      sendJson(res, 200, { id: targetId });
      return;
    }

    sendJson(res, 405, { message: 'Method not allowed' });
  } catch (error) {
    sendJson(res, isBadRequest(error) ? 400 : 500, {
      message: error instanceof Error ? error.message : 'Mock server error',
    });
  }
};
