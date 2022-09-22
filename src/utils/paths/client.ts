export abstract class ClientPaths {
	static root() {
		return '/api/assets';
	}

	static collabs() {
		return [this.root(), 'collabs'].join('/');
	}

	static collab(collabId: string) {
		return [this.collabs(), collabId].join('/');
	}

	static picks(collabId: string) {
		return [this.collab(collabId), 'picks'].join('/');
	}

	static pick(collabId: string, pickId: string) {
		return [this.picks(collabId), pickId].join('/');
	}

	static assets(collabId: string, pickId: string) {
		return [this.pick(collabId, pickId), 'assets'].join('/');
	}

	static asset(collabId: string, pickId: string, collabAssetId: string) {
		return [this.assets(collabId, pickId), collabAssetId].join('/');
	}

	static storedAsset(
		collabId: string,
		pickId: string,
		collabAssetId: string,
		file: string,
		creationDate: Date
	) {
		return (
			[this.asset(collabId, pickId, collabAssetId), file].join('/') +
			'?d=' +
			encodeURIComponent(creationDate.toString())
		);
	}

	static deleteAsset(assetId: string) {
		return [this.root(), assetId].join('/');
	}
}
