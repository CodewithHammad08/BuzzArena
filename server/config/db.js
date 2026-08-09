/**
 * MongoDB Connection (optional)
 * Only connects if MONGODB_URI is set in environment.
 */

const mongoose = require('mongoose');

async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('[DB] MONGODB_URI not set — running in memory-only mode.');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('[DB] MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    console.error('[DB] MongoDB connection failed:', err.message);
    console.log('[DB] Falling back to in-memory mode.');
  }
}

module.exports = { connectDB };
