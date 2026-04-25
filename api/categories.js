const { applyCors, handleOptions, loadDb, sendJson } = require('../mock-server/vercel-utils.cjs');

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== 'GET') {
    sendJson(res, 405, { message: 'Method not allowed' });
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const db = await loadDb();

  sendJson(
    res,
    200,
    db.categories.filter((item) => item.userId === url.searchParams.get('userId')),
  );
};
