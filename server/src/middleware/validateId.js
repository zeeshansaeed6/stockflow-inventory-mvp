/**
 * router.param handler: reject malformed ObjectIds with a 404
 * instead of letting Mongoose throw a CastError (500).
 */
const mongoose = require('mongoose');

function validateId(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id) || !/^[0-9a-f]{24}$/i.test(id)) {
    return res.status(404).json({ message: 'Not found' });
  }
  return next();
}

module.exports = validateId;
