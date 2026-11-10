/**
 * JWT auth middleware.
 * Expects `Authorization: Bearer <token>`, verifies the token,
 * and attaches { userId, organizationId } to req.auth.
 */

const jwt = require('jsonwebtoken');

function authRequired(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Guard: a legitimate token carries ObjectId hex strings.
    // Reject anything else so downstream Mongoose queries never see garbage
    // (e.g. a stale token signed before a bugfix landed).
    const isHexId = (v) => typeof v === 'string' && /^[0-9a-f]{24}$/i.test(v);
    if (!isHexId(payload.sub) || !isHexId(payload.org)) {
      return res.status(401).json({ message: 'Token payload is invalid' });
    }

    req.auth = {
      userId: payload.sub,
      organizationId: payload.org,
    };
    return next();
  } catch (_err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = { authRequired };
