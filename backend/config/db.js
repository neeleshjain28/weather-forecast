import mongoose from 'mongoose';

let isMock = false;

export async function connectDB() {
  if (process.env.USE_MOCK_DB === 'true') {
    console.log('⚠️ Database: USE_MOCK_DB is set to true. Using local JSON database.');
    isMock = true;
    return { isMock: true };
  }
  
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/uptowheather', {
      serverSelectionTimeoutMS: 2000
    });
    console.log('✅ Connected to MongoDB successfully.');
    isMock = false;
    return { isMock: false };
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed. Falling back to local JSON database.');
    isMock = true;
    return { isMock: true };
  }
}

export function getDbMode() {
  return isMock;
}
