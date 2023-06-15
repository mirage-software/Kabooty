import path from 'path';
import { Env } from '../../env';

export abstract class ServerPaths {
	static root() {
		const env = Env.load();

		return env['FILE_STORAGE_PATH'];
	}

	static collabs() {
		return path.join(this.root(), 'collabs');
	}

	static collab(collabId: string) {
		return path.join(this.collabs(), collabId);
	}

	static collabAsset(collabId: string, collabAssetId: string) {
		return path.join(this.collab(collabId), collabAssetId + '.png');
	}

	static picks(collabId: string) {
		return path.join(this.collab(collabId), 'picks');
	}

	static pick(collabId: string, pickId: string) {
		return path.join(this.picks(collabId), pickId);
	}

	static assets(collabId: string, pickId: string) {
		return path.join(this.pick(collabId, pickId), 'assets');
	}

	static asset(collabId: string, pickId: string, collabAssetId: string) {
		return path.join(this.assets(collabId, pickId), collabAssetId);
	}

	static generateAssetName(pickId: string, collabAssetId: string, assetType: string) {
		return pickId + '.' + collabAssetId + '.' + assetType;
	}
}
