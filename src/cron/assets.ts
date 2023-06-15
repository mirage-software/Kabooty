import { CronJob } from 'cron';
import { lstat, readdir, rmdir } from 'fs/promises';
import path from 'path';
import { ServerPaths } from '../utils/paths/server';

export abstract class Assets {
	static async start() {
		await Assets.clean();

		new CronJob('0 */12 * * *', Assets.clean, null, true);
	}

	static async clean(directory: string = ServerPaths.root()) {
		if (!directory) {
			return;
		}

		const fileStats = await lstat(directory);

		if (!fileStats.isDirectory()) {
			return;
		}

		let fileNames = await readdir(directory);

		if (fileNames.length > 0) {
			const recursiveRemovalPromises = fileNames.map((fileName) =>
				Assets.clean(path.join(directory, fileName))
			);
			await Promise.all(recursiveRemovalPromises);

			// Check if the directory is empty now
			fileNames = await readdir(directory);
		}

		if (fileNames.length === 0) {
			await rmdir(directory);
		}
	}
}
