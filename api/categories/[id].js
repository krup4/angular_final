const { applyCors, handleOptions, loadDb, readBody, saveDb, sendJson } = require('../../mock-server/vercel-utils.cjs');
const { buildCategory, isBadRequest } = require('../../mock-server/category-utils.cjs');

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const { id } = req.query ?? {};
    const categoryId = Array.isArray(id) ? id[0] : id;
    const fallbackId = decodeURIComponent(url.pathname.split('/').filter(Boolean).at(-1) ?? '');
    const targetId = categoryId || fallbackId;
    const db = await loadDb();

    if (req.method === 'PUT') {
      const draft = await readBody(req);
      const index = db.categories.findIndex((item) => item.id === targetId);

      if (index === -1) {
        sendJson(res, 404, { message: 'Категория не найдена' });
        return;
      }

      db.categories[index] = buildCategory(draft, db.categories[index]);
      await saveDb(db);
      sendJson(res, 200, db.categories[index]);
      return;
    }

    sendJson(res, 405, { message: 'Method not allowed' });
  } catch (error) {
    sendJson(res, isBadRequest(error) ? 400 : 500, {
      message: error instanceof Error ? error.message : 'Mock server error',
    });
  }
};
