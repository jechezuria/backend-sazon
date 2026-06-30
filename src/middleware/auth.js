const { verifyToken } = require('../lib/jwt');

// Exige un JWT válido. Si falta o es inválido, corta el request con 401
// antes de que llegue al controlador.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no provisto' });
  }

  const token = header.slice('Bearer '.length);
  try {
    req.userId = verifyToken(token);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { requireAuth };
