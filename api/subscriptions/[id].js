const { applyCors, handleOptions, loadDb, readBody, saveDb, sendJson } = require('../../mock-server/vercel-utils.cjs');

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  try {
    const { id } = req.query;
    const subscriptionId = Array.isArray(id) ? id[0] : id;
    const db = await loadDb();

    if (req.method === 'PUT') {
      const updated = await readBody(req);
      const index = db.subscriptions.findIndex((item) => item.id === subscriptionId);

      if (index === -1) {
        sendJson(res, 404, { message: 'Подписка не найдена' });
        return;
      }

      db.subscriptions[index] = { ...updated, id: subscriptionId };
      await saveDb(db);
      sendJson(res, 200, db.subscriptions[index]);
      return;
    }

    if (req.method === 'DELETE') {
      db.subscriptions = db.subscriptions.filter((item) => item.id !== subscriptionId);
      await saveDb(db);
      sendJson(res, 200, { id: subscriptionId });
      return;
    }

    sendJson(res, 405, { message: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, { message: error instanceof Error ? error.message : 'Mock server error' });
  }
};
