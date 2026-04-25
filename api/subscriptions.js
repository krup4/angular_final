const { randomUUID } = require('node:crypto');
const { applyCors, handleOptions, loadDb, readBody, sendJson } = require('../mock-server/vercel-utils.cjs');

let subscriptions = loadDb().subscriptions;

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'GET') {
      sendJson(
        res,
        200,
        subscriptions.filter((item) => item.userId === url.searchParams.get('userId')),
      );
      return;
    }

    if (req.method === 'POST') {
      const draft = await readBody(req);
      const created = { ...draft, id: randomUUID(), currency: 'RUB' };
      subscriptions.push(created);
      sendJson(res, 201, created);
      return;
    }

    sendJson(res, 405, { message: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, { message: error instanceof Error ? error.message : 'Mock server error' });
  }
};
