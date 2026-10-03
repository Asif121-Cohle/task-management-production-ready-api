import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export const testDatabaseStateFile = path.join(os.tmpdir(), 'task-management-test-database.json');

export default async () => {
	try {
		const state = JSON.parse(await fs.readFile(testDatabaseStateFile, 'utf8'));
		if (state.pid) {
			process.kill(state.pid);
		}
	} catch {
		// The test process may already have stopped the database.
	} finally {
		await fs.rm(testDatabaseStateFile, { force: true });
	}
};
