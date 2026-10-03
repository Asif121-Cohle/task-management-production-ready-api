import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { MongoMemoryServer } from 'mongodb-memory-server';

export const testDatabaseStateFile = path.join(os.tmpdir(), 'task-management-test-database.json');

export default async () => {
	const mongoServer = await MongoMemoryServer.create();
	const instanceInfo = mongoServer.instanceInfo;

	await fs.writeFile(
		testDatabaseStateFile,
		JSON.stringify({
			uri: mongoServer.getUri(),
			pid: instanceInfo?.instance.mongodProcess.pid
		}),
		'utf8'
	);
};
