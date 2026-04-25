const { applyCors, handleOptions, loadDb, readBody, sendJson } = require('../../mock-server/vercel-utils.cjs');

let subscriptions = loadDb().subscriptions;

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  try {
    const { id } = req.query;
    const subscriptionId = Array.isArray(id) ? id[0] : id;

    if (req.method === 'PUT') {
      const updated = await readBody(req);
      const index = subscriptions.findIndex((item) => item.id === subscriptionId);

      if (index === -1) {
        sendJson(res, 404, { message: 'Подписка не найдена' });
        return;
      }

      subscriptions[index] = { ...updated, id: subscriptionId };
      sendJson(res, 200, subscriptions[index]);
      return;
    }

    if (req.method === 'DELETE') {
      subscriptions = subscriptions.filter((item) => item.id !== subscriptionId);
      res.statusCode = 204;
      res.end();
      return;
    }

    sendJson(res, 405, { message: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, { message: error instanceof Error ? error.message : 'Mock server error' });
  }
};
