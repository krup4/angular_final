const { applyCors, handleOptions, loadDb, readBody, sendJson } = require('../../mock-server/vercel-utils.cjs');

module.exports = async function handler(req, res) {
  applyCors(res);

  if (handleOptions(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { message: 'Method not allowed' });
    return;
  }

  try {
    const credentials = await readBody(req);
    const db = loadDb();
    const user = db.users.find(
      (item) => item.email === credentials.email && item.password === credentials.password,
    );

    if (!user) {
      sendJson(res, 401, { message: 'Неверный email или пароль' });
      return;
    }

    const { password, ...safeUser } = user;
    sendJson(res, 200, {
      token: `mock-jwt-${user.id}`,
      user: safeUser,
    });
  } catch (error) {
    sendJson(res, 500, { message: error instanceof Error ? error.message : 'Mock server error' });
  }
};
