import { lstat, readdir, rmdir } from 'fs/promises';
import path from 'path';
import { ServerPaths } from '../utils/paths/server';

export abstract class Assets {
	static readonly loopInterval = 1000 * 60 * 60 * 12; // 12 hours

	static async setupLoop() {
		Assets.clean();

		setInterval(() => {
			Assets.clean();
		}, Assets.loopInterval);
	}

	static async clean(directory: string = ServerPaths.root()) {
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
