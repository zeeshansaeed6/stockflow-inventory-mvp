/**
 * Auth controller: signup, login, current user.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/User');
const Organization = require('../models/Organization');

// Build a JWT for a given user. Handles both raw ObjectId and populated doc.
function signToken(user) {
  const orgId = user.organization?._id
    ? user.organization._id.toString()
    : user.organization.toString();
  return jwt.sign(
    { sub: user._id.toString(), org: orgId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

/**
 * POST /api/auth/signup
 * Body: { email, password, organizationName }
 * Creates an Organization + User and returns { token, user }.
 */
async function signup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password, organizationName } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const org = await Organization.create({ name: organizationName });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase(),
      passwordHash,
      organization: org._id,
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        organization: { id: org._id, name: org.name },
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).populate('organization');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        organization: { id: user.organization._id, name: user.organization.name },
      },
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/auth/me
 * Returns the logged-in user's profile.
 */
async function me(req, res, next) {
  try {
    const user = await User.findById(req.auth.userId).populate('organization');
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({
      id: user._id,
      email: user.email,
      organization: { id: user.organization._id, name: user.organization.name },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { signup, login, me };
