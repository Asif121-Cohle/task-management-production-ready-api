import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import mongoose from 'mongoose';

const testDatabaseStateFile = path.join(os.tmpdir(), 'task-management-test-database.json');

export const startTestDatabase = async () => {
  const state = JSON.parse(await fs.readFile(testDatabaseStateFile, 'utf8'));
  await mongoose.connect(state.uri);
};

export const stopTestDatabase = async () => {
  await mongoose.disconnect();
};

export const clearTestDatabase = async () => {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
};
