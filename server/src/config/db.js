/**
 * MongoDB connection helper.
 *
 * Priority:
 *   1. If MONGO_URI is set in env  -> connect to it.
 *   2. Else, spin up an in-memory MongoDB (via mongodb-memory-server)
 *      so the app runs on any machine without installing MongoDB.
 *
 * The in-memory server only runs in development; production must
 * supply a real MONGO_URI.
 */

const mongoose = require('mongoose');

async function connectDB() {
  mongoose.set('strictQuery', true);

  let uri = process.env.MONGO_URI;

  if (!uri) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGO_URI is required in production.');
    }
    // Lazy-require so the dependency isn't needed when MONGO_URI is set.
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri();
    console.log('Using in-memory MongoDB at', uri);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected');
}

module.exports = connectDB;
