/**
 * MongoDB connection helper.
 * Reads MONGO_URI from env and connects via Mongoose.
 */

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error('MONGO_URI is not set. See server/.env.example.');
  }

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
