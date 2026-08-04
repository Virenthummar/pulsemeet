import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://virenthummar007_db_user:3QfXsdHlV3pFquCM@viren.cuz4v1i.mongodb.net/pulsemeet?retryWrites=true&w=majority';

let cachedConnection = null;

export const connectToDatabase = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };
    cachedConnection = await mongoose.connect(MONGODB_URI, opts);
    console.log('Connected to MongoDB database');
    return cachedConnection;
  } catch (error) {
    console.warn('MongoDB Connection Warning:', error.message);
    throw error;
  }
};
