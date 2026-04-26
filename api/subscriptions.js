const { randomUUID } = require('node:crypto');
const { applyCors, handleOptions, loadDb, readBody, saveDb, sendJson } = require('../mock-server/vercel-utils.cjs');
const { buildSubscription, isBadRequest } = require('../mock-server/subscription-utils.cjs');

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const db = await loadDb();

    if (req.method === 'GET') {
      sendJson(
        res,
        200,
        db.subscriptions.filter((item) => item.userId === url.searchParams.get('userId')),
      );
      return;
    }

    if (req.method === 'POST') {
      const draft = await readBody(req);
      const created = buildSubscription(draft, {
        categories: db.categories,
        id: randomUUID(),
      });
      db.subscriptions.push(created);
      await saveDb(db);
      sendJson(res, 201, created);
      return;
    }

    sendJson(res, 405, { message: 'Method not allowed' });
  } catch (error) {
    sendJson(res, isBadRequest(error) ? 400 : 500, {
      message: error instanceof Error ? error.message : 'Mock server error',
    });
  }
};
