import { PrismaClient, type CollabAsset } from '@prisma/client';
import { mkdirSync, renameSync } from 'fs';
import path from 'path';
import { SentryClient } from '../bot/sentry';
import { Env } from '../env';
import { ServerPaths } from '../utils/paths/server';
import { Assets } from './assets';
import characters from './characters.json';

export abstract class Prisma {
	static _client: PrismaClient;

	static async importCharacters() {
		if ((await Prisma._client.animeCharacter.count()) > 0) {
			return;
		}

		console.log('Importing characters...');
		try {
			await Prisma._client.animeCharacter.createMany({
				data: characters as { name: string; id: number; anime_name: string }[],
				skipDuplicates: true
			});
			console.log('Characters imported!');
		} catch (error) {
			SentryClient.log(error);
		}
	}

	static async runImageMigration() {
		if ((await Prisma._client.collabAsset.count()) > 0) {
			return;
		}

		const env = Env.load();

		const collabs = await Prisma._client.collab.findMany({});

		const collabAssets: { [x: string]: CollabAsset } = {};

		for (const collab of collabs) {
			collabAssets[collab.id] = await Prisma._client.collabAsset.create({
				data: {
					collabId: collab.id,
					assetType: 'avatar',
					assetName: 'Avatar',
					mainAsset: true,
					assetWidth: 900,
					assetHeight: 900
				}
			});
		}

		let page = 0;
		let picks = await Prisma._client.pick.findMany({
			where: {
				NOT: {
					image: null
				}
			},
			take: 100
		});

		while (picks.length > 0) {
			for (let i = 0; i < picks.length; i++) {
				const pick = picks[i];

				if (pick.image) {
					const ext = path.extname(pick.image);

					const collabAsset = collabAssets[pick.collabId];

					const newImageName =
						ServerPaths.generateAssetName(pick.id, collabAsset.id, collabAsset.assetType) + ext;

					const filePath = path.join(
						env['FILE_STORAGE_PATH'],
						'collabs',
						pick.collabId,
						'picks',
						pick.image
					);

					const newFilePath = path.join(
						ServerPaths.asset(pick.collabId, pick.id, collabAsset.id),
						newImageName
					);

					mkdirSync(path.dirname(newFilePath), { recursive: true });
					renameSync(filePath, newFilePath);

					await Prisma._client.asset.create({
						data: {
							collabId: pick.collabId,
							collabAssetId: collabAssets[pick.collabId].id,
							createdAt: pick.createdAt,
							image: newImageName,
							pickId: pick.id,
							userId: pick.userId
						}
					});
				}
			}

			page++;
			picks = await Prisma._client.pick.findMany({
				where: {
					NOT: {
						image: null
					}
				},
				skip: page * 100,
				take: 100
			});
		}
	}

	static get client() {
		if (!Prisma._client) {
			Prisma._client = new PrismaClient();
			Prisma.importCharacters();
			Prisma.runImageMigration();
			Assets.setupLoop();
		}

		return Prisma._client;
	}
}
