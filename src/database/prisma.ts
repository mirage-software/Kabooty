import { PrismaClient } from '@prisma/client';
import { SentryClient } from '../bot/sentry';
import characters from './characters.json';

export abstract class Prisma {
	static _client: PrismaClient;

	static async importCharacters() {
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

	static get client() {
		if (!Prisma._client) {
			Prisma._client = new PrismaClient();
			Prisma.importCharacters();
		}

		return Prisma._client;
	}
}
