import { PrismaClient } from '@prisma/client';
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
		} catch (error) {
			console.log(error);
		}
		console.log('Characters imported!');
	}

	static get client() {
		if (!Prisma._client) {
			Prisma._client = new PrismaClient();
			Prisma.importCharacters();
		}

		return Prisma._client;
	}
}
