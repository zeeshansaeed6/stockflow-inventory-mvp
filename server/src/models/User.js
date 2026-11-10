/**
 * User model.
 * MVP: single user per organization (owner).
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // bcrypt hash; never returned by API.
    passwordHash: { type: String, required: true },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
