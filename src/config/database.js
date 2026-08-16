import mongoose from 'mongoose';

export const connectDatabase = async (mongoUri) => {
  await mongoose.connect(mongoUri, {
    maxPoolSize: 20,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 10000
  });
};

export const disconnectDatabase = async () => {
  await mongoose.connection.close();
};

export const getDatabaseHealth = () => {
  const { readyState } = mongoose.connection;

  switch (readyState) {
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
};
